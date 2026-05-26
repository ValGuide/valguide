import { and, desc, eq, isNull, or } from 'drizzle-orm'
import { serverEnv } from '../../env/server'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { db } from '../db'
import { stop, tour, tourStop, tourStopDraft } from '../tours/schema'
import { generateShortCode } from './generator'
import { deleteCache, getLinkCacheKey } from './kv'
import {
  normalizeExternalUrl,
  normalizeOptionalText,
  normalizeRequiredText,
  parseOptionalExpiry,
} from './managed-link-validation'
import { buildShortLinkUrl } from './public-url'
import { type ShortLink, type ShortLinkInsert, type ShortLinkStatus, type ShortLinkType, short_links } from './schema'
import { isUniqueViolation, MAX_RETRIES } from './utils'

export type ManagedLinkDestination =
  | { type: 'tour'; tourNanoId: string }
  | { type: 'stop'; tourNanoId: string; stopNanoId: string }
  | { type: 'campaign'; campaignId: string }
  | { type: 'external'; externalUrl: string }
  | { type: 'landing_page'; pageSlug: string; locale: string }

export type ManagedLinkMutationInput = {
  title: string
  description?: string | null
  context?: string | null
  expiresAt?: string | Date | null
  destination: ManagedLinkDestination
}

export type ManagedLinkListItem = {
  id: number
  code: string
  shortUrl: string
  type: ShortLinkType
  status: ShortLinkStatus
  title: string
  description: string | null
  context: string | null
  destinationLabel: string
  destination: ManagedLinkDestination
  openCount: number
  lastOpenedAt: Date | null
  expiresAt: Date | null
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

type NormalizedManagedLinkInput = {
  title: string
  description: string | null
  context: string | null
  expiresAt: Date | null
  destination: ManagedLinkDestination
}

export type ListManagedLinksOptions = {
  includeArchived?: boolean
}

function buildShortUrl(code: string): string {
  return buildShortLinkUrl(serverEnv.LINKS_BASE_URL, code)
}

function normalizeInput(input: ManagedLinkMutationInput): NormalizedManagedLinkInput {
  return {
    title: normalizeRequiredText(input.title, 'Title'),
    description: normalizeOptionalText(input.description),
    context: normalizeOptionalText(input.context),
    expiresAt: parseOptionalExpiry(input.expiresAt),
    destination: normalizeDestination(input.destination),
  }
}

function normalizeDestination(destination: ManagedLinkDestination): ManagedLinkDestination {
  switch (destination.type) {
    case 'tour':
      return { type: 'tour', tourNanoId: normalizeRequiredText(destination.tourNanoId, 'Tour') }
    case 'stop':
      return {
        type: 'stop',
        tourNanoId: normalizeRequiredText(destination.tourNanoId, 'Tour'),
        stopNanoId: normalizeRequiredText(destination.stopNanoId, 'Stop'),
      }
    case 'campaign':
      return { type: 'campaign', campaignId: normalizeRequiredText(destination.campaignId, 'Campaign') }
    case 'external':
      return { type: 'external', externalUrl: normalizeExternalUrl(destination.externalUrl) }
    case 'landing_page':
      return {
        type: 'landing_page',
        pageSlug: normalizeSlug(destination.pageSlug),
        locale: normalizeLocale(destination.locale),
      }
  }
}

function normalizeSlug(value: string): string {
  const slug = normalizeRequiredText(value, 'Page slug')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Use a lowercase slug with letters, numbers, and hyphens.')
  }
  return slug
}

function normalizeLocale(value: string): string {
  const locale = normalizeRequiredText(value, 'Locale')
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)) {
    throw new Error('Enter a valid locale.')
  }
  return locale
}

async function assertDestinationBelongsToOrg(
  organizationId: string,
  destination: ManagedLinkDestination,
): Promise<void> {
  switch (destination.type) {
    case 'tour': {
      const foundTour = await db.query.tour.findFirst({
        columns: { id: true },
        where: and(
          eq(tour.organizationId, organizationId),
          eq(tour.nanoId, destination.tourNanoId),
          isNull(tour.deletedAt),
        ),
      })
      if (!foundTour) throw new NotFoundError('Tour')
      return
    }
    case 'stop': {
      const [foundTour, foundStop] = await Promise.all([
        db.query.tour.findFirst({
          columns: { id: true },
          where: and(
            eq(tour.organizationId, organizationId),
            eq(tour.nanoId, destination.tourNanoId),
            isNull(tour.deletedAt),
          ),
        }),
        db.query.stop.findFirst({
          columns: { id: true },
          where: and(
            eq(stop.organizationId, organizationId),
            eq(stop.nanoId, destination.stopNanoId),
            isNull(stop.deletedAt),
          ),
        }),
      ])
      if (!foundTour) throw new NotFoundError('Tour')
      if (!foundStop) throw new NotFoundError('Stop')

      const relation = await db.query.tourStopDraft.findFirst({
        columns: { id: true },
        where: and(eq(tourStopDraft.tourId, foundTour.id), eq(tourStopDraft.stopId, foundStop.id)),
      })
      if (relation) return

      const publishedRelation = await db.query.tourStop.findFirst({
        columns: { id: true },
        where: and(eq(tourStop.tourId, foundTour.id), eq(tourStop.stopId, foundStop.id)),
      })
      if (!publishedRelation) {
        throw new ForbiddenError('Stop is not part of this tour')
      }
      return
    }
    case 'campaign':
    case 'external':
    case 'landing_page':
      return
  }
}

function destinationToInsert(
  destination: ManagedLinkDestination,
): Pick<
  ShortLinkInsert,
  'type' | 'tourNanoId' | 'stopNanoId' | 'campaignId' | 'externalUrl' | 'pageSlug' | 'locale' | 'target'
> {
  switch (destination.type) {
    case 'tour':
      return {
        type: destination.type,
        tourNanoId: destination.tourNanoId,
        stopNanoId: null,
        campaignId: null,
        externalUrl: null,
        pageSlug: null,
        locale: null,
        target: { source: 'qr' },
      }
    case 'stop':
      return {
        type: destination.type,
        tourNanoId: destination.tourNanoId,
        stopNanoId: destination.stopNanoId,
        campaignId: null,
        externalUrl: null,
        pageSlug: null,
        locale: null,
        target: { source: 'qr' },
      }
    case 'campaign':
      return {
        type: destination.type,
        tourNanoId: null,
        stopNanoId: null,
        campaignId: destination.campaignId,
        externalUrl: null,
        pageSlug: null,
        locale: null,
        target: { source: 'qr' },
      }
    case 'external':
      return {
        type: destination.type,
        tourNanoId: null,
        stopNanoId: null,
        campaignId: null,
        externalUrl: destination.externalUrl,
        pageSlug: null,
        locale: null,
        target: { source: 'qr' },
      }
    case 'landing_page':
      return {
        type: destination.type,
        tourNanoId: null,
        stopNanoId: null,
        campaignId: null,
        externalUrl: null,
        pageSlug: destination.pageSlug,
        locale: destination.locale,
        target: { source: 'qr' },
      }
  }
}

async function findExistingManagedTarget(
  organizationId: string,
  destination: ManagedLinkDestination,
): Promise<ShortLink | null> {
  switch (destination.type) {
    case 'tour':
      return (
        (await db.query.short_links.findFirst({
          where: and(
            eq(short_links.organizationId, organizationId),
            eq(short_links.type, 'tour'),
            eq(short_links.tourNanoId, destination.tourNanoId),
          ),
        })) ?? null
      )
    case 'stop':
      return (
        (await db.query.short_links.findFirst({
          where: and(
            eq(short_links.organizationId, organizationId),
            eq(short_links.type, 'stop'),
            eq(short_links.tourNanoId, destination.tourNanoId),
            eq(short_links.stopNanoId, destination.stopNanoId),
          ),
        })) ?? null
      )
    case 'campaign':
      return (
        (await db.query.short_links.findFirst({
          where: and(
            eq(short_links.organizationId, organizationId),
            eq(short_links.type, 'campaign'),
            eq(short_links.campaignId, destination.campaignId),
          ),
        })) ?? null
      )
    case 'landing_page':
      return (
        (await db.query.short_links.findFirst({
          where: and(
            eq(short_links.organizationId, organizationId),
            eq(short_links.type, 'landing_page'),
            eq(short_links.pageSlug, destination.pageSlug),
            eq(short_links.locale, destination.locale),
          ),
        })) ?? null
      )
    case 'external':
      return null
  }
}

function toDestination(link: ShortLink): ManagedLinkDestination {
  switch (link.type) {
    case 'tour':
      return { type: 'tour', tourNanoId: link.tourNanoId ?? '' }
    case 'stop':
      return { type: 'stop', tourNanoId: link.tourNanoId ?? '', stopNanoId: link.stopNanoId ?? '' }
    case 'campaign':
      return { type: 'campaign', campaignId: link.campaignId ?? '' }
    case 'external':
      return { type: 'external', externalUrl: link.externalUrl ?? '' }
    case 'landing_page':
      return { type: 'landing_page', pageSlug: link.pageSlug ?? '', locale: link.locale ?? '' }
  }
}

function getDestinationLabel(link: ShortLink): string {
  switch (link.type) {
    case 'tour':
      return link.tourNanoId ? `Tour ${link.tourNanoId}` : 'Tour'
    case 'stop':
      return link.stopNanoId ? `Stop ${link.stopNanoId}` : 'Stop'
    case 'campaign':
      return link.campaignId ? `Campaign ${link.campaignId}` : 'Campaign'
    case 'external':
      return link.externalUrl ?? 'External URL'
    case 'landing_page':
      return link.locale && link.pageSlug ? `/${link.locale}/${link.pageSlug}` : 'Landing page'
  }
}

function toListItem(link: ShortLink): ManagedLinkListItem {
  return {
    id: link.id,
    code: link.code,
    shortUrl: buildShortUrl(link.code),
    type: link.type,
    status: link.status,
    title: link.title ?? getDestinationLabel(link),
    description: link.description,
    context: link.context,
    destinationLabel: getDestinationLabel(link),
    destination: toDestination(link),
    openCount: link.openCount,
    lastOpenedAt: link.lastOpenedAt,
    expiresAt: link.expiresAt,
    archivedAt: link.archivedAt,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  }
}

export async function listManagedLinks(
  organizationId: string,
  options: ListManagedLinksOptions = {},
): Promise<ManagedLinkListItem[]> {
  const conditions = [eq(short_links.organizationId, organizationId)]
  if (!options.includeArchived) {
    conditions.push(eq(short_links.status, 'active'))
  }

  const rows = await db.query.short_links.findMany({
    where: and(...conditions),
    orderBy: [desc(short_links.updatedAt), desc(short_links.createdAt)],
  })

  return rows.map(toListItem)
}

export async function getManagedLink(organizationId: string, id: number): Promise<ManagedLinkListItem> {
  const link = await db.query.short_links.findFirst({
    where: and(eq(short_links.organizationId, organizationId), eq(short_links.id, id)),
  })
  if (!link) {
    throw new NotFoundError('Link')
  }
  return toListItem(link)
}

export async function createManagedLink(
  organizationId: string,
  userId: string,
  input: ManagedLinkMutationInput,
): Promise<ManagedLinkListItem> {
  const normalized = normalizeInput(input)
  await assertDestinationBelongsToOrg(organizationId, normalized.destination)

  const existing = await findExistingManagedTarget(organizationId, normalized.destination)
  if (existing) {
    const [updated] = await db
      .update(short_links)
      .set({
        ...destinationToInsert(normalized.destination),
        title: normalized.title,
        description: normalized.description,
        context: normalized.context,
        expiresAt: normalized.expiresAt,
        status: 'active',
        archivedAt: null,
        updatedBy: userId,
      })
      .where(and(eq(short_links.organizationId, organizationId), eq(short_links.id, existing.id)))
      .returning()

    if (!updated) throw new Error('Failed to update managed link')
    await deleteCache(getLinkCacheKey(updated.code))
    return toListItem(updated)
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = generateShortCode()
    try {
      const [created] = await db
        .insert(short_links)
        .values({
          organizationId,
          code,
          ...destinationToInsert(normalized.destination),
          title: normalized.title,
          description: normalized.description,
          context: normalized.context,
          expiresAt: normalized.expiresAt,
          status: 'active',
          createdBy: userId,
          updatedBy: userId,
        })
        .returning()
      if (!created) throw new Error('Failed to create managed link')
      return toListItem(created)
    } catch (error) {
      if (!isUniqueViolation(error)) throw error
    }
  }

  throw new Error('Failed to generate unique short code after multiple attempts')
}

export async function updateManagedLink(
  organizationId: string,
  userId: string,
  id: number,
  input: ManagedLinkMutationInput,
): Promise<ManagedLinkListItem> {
  const normalized = normalizeInput(input)
  await assertDestinationBelongsToOrg(organizationId, normalized.destination)

  const [updated] = await db
    .update(short_links)
    .set({
      ...destinationToInsert(normalized.destination),
      title: normalized.title,
      description: normalized.description,
      context: normalized.context,
      expiresAt: normalized.expiresAt,
      updatedBy: userId,
    })
    .where(and(eq(short_links.organizationId, organizationId), eq(short_links.id, id)))
    .returning()

  if (!updated) throw new NotFoundError('Link')
  await deleteCache(getLinkCacheKey(updated.code))
  return toListItem(updated)
}

export async function archiveManagedLink(
  organizationId: string,
  userId: string,
  id: number,
): Promise<ManagedLinkListItem> {
  const [updated] = await db
    .update(short_links)
    .set({
      status: 'archived',
      archivedAt: new Date(),
      updatedBy: userId,
    })
    .where(
      and(
        eq(short_links.organizationId, organizationId),
        eq(short_links.id, id),
        or(eq(short_links.status, 'active'), isNull(short_links.archivedAt)),
      ),
    )
    .returning()

  if (!updated) throw new NotFoundError('Link')
  await deleteCache(getLinkCacheKey(updated.code))
  return toListItem(updated)
}
