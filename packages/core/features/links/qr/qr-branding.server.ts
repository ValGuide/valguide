import { and, eq, isNull } from 'drizzle-orm'
import { serverEnv } from '../../../env/server'
import { ForbiddenError, NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { organization } from '../../orgs/schema'
import { stop, tour, tourStop, tourStopDraft } from '../../tours/schema'
import { getOrCreateStopShortLink, getOrCreateTourShortLink } from '../get-or-create-short-link'
import { getShortLinkAnalytics } from '../get-short-link-analytics.server'
import { buildShortLinkUrl } from '../public-url'
import { organization_qr_branding, stop_qr_branding, tour_qr_branding } from '../schema'
import {
  type EffectiveQrBranding,
  isQrBrandingOverrideEmpty,
  type QrAnalyticsSummary,
  type QrBrandingOverride,
  resolveQrBranding,
  sanitizeQrBrandingOverride,
} from './shared'

type OrganizationQrContext = {
  id: string
  nanoId: string
  name: string
  logoStoragePath: string | null
}

type TourQrContext = {
  id: string
  nanoId: string
  organizationId: string
  logoStoragePath: string | null
}

type StopQrContext = {
  id: string
  nanoId: string
  organizationId: string
  logoStoragePath: string | null
}

export type OrganizationQrBrandingSettings = {
  organization: OrganizationQrContext
  linksBaseUrl: string
  override: QrBrandingOverride
  inheritedBranding: EffectiveQrBranding
  effectiveBranding: EffectiveQrBranding
}

type QrCodePayloadBase = {
  shortCode: string
  shortUrl: string
  override: QrBrandingOverride
  inheritedBranding: EffectiveQrBranding
  effectiveBranding: EffectiveQrBranding
  analytics: QrAnalyticsSummary
}

export type TourQrCodePayload = QrCodePayloadBase & {
  kind: 'tour'
  tourNanoId: string
}

export type StopQrCodePayload = QrCodePayloadBase & {
  kind: 'stop'
  tourNanoId: string
  stopNanoId: string
}

function getLinksBaseUrl(): string {
  return serverEnv.LINKS_BASE_URL
}

async function getOrganizationQrContext(organizationId: string): Promise<OrganizationQrContext> {
  const [orgRow] = await db
    .select({
      id: organization.id,
      nanoId: organization.nanoId,
      name: organization.name,
      logoStoragePath: organization.logoStoragePath,
    })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1)

  if (!orgRow) {
    throw new NotFoundError('Organization')
  }

  return orgRow
}

async function getTourQrContext(tourNanoId: string): Promise<TourQrContext> {
  const [tourRow] = await db
    .select({
      id: tour.id,
      nanoId: tour.nanoId,
      organizationId: tour.organizationId,
      logoStoragePath: organization.logoStoragePath,
    })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .where(and(eq(tour.nanoId, tourNanoId), isNull(tour.deletedAt)))
    .limit(1)

  if (!tourRow) {
    throw new NotFoundError('Tour')
  }

  return tourRow
}

async function getStopQrContext(stopNanoId: string): Promise<StopQrContext> {
  const [stopRow] = await db
    .select({
      id: stop.id,
      nanoId: stop.nanoId,
      organizationId: stop.organizationId,
      logoStoragePath: organization.logoStoragePath,
    })
    .from(stop)
    .innerJoin(organization, eq(stop.organizationId, organization.id))
    .where(and(eq(stop.nanoId, stopNanoId), isNull(stop.deletedAt)))
    .limit(1)

  if (!stopRow) {
    throw new NotFoundError('Stop')
  }

  return stopRow
}

async function getOrgQrOverride(organizationId: string): Promise<QrBrandingOverride> {
  const row = await db.query.organization_qr_branding.findFirst({
    where: eq(organization_qr_branding.organizationId, organizationId),
  })
  return sanitizeQrBrandingOverride(row?.overrides)
}

async function getTourQrOverrideByTourId(tourId: string): Promise<QrBrandingOverride> {
  const row = await db.query.tour_qr_branding.findFirst({
    where: eq(tour_qr_branding.tourId, tourId),
  })
  return sanitizeQrBrandingOverride(row?.overrides)
}

async function getStopQrOverrideByStopId(stopId: string): Promise<QrBrandingOverride> {
  const row = await db.query.stop_qr_branding.findFirst({
    where: eq(stop_qr_branding.stopId, stopId),
  })
  return sanitizeQrBrandingOverride(row?.overrides)
}

async function saveOrgOverride(organizationId: string, overrides: QrBrandingOverride, updatedBy: string) {
  const existing = await db.query.organization_qr_branding.findFirst({
    where: eq(organization_qr_branding.organizationId, organizationId),
  })

  if (isQrBrandingOverrideEmpty(overrides)) {
    if (existing) {
      await db.delete(organization_qr_branding).where(eq(organization_qr_branding.id, existing.id))
    }
    return
  }

  if (existing) {
    await db
      .update(organization_qr_branding)
      .set({ overrides, updatedBy })
      .where(eq(organization_qr_branding.id, existing.id))
    return
  }

  await db.insert(organization_qr_branding).values({
    organizationId,
    overrides,
    updatedBy,
  })
}

async function saveTourOverride(tourId: string, overrides: QrBrandingOverride, updatedBy: string) {
  const existing = await db.query.tour_qr_branding.findFirst({
    where: eq(tour_qr_branding.tourId, tourId),
  })

  if (isQrBrandingOverrideEmpty(overrides)) {
    if (existing) {
      await db.delete(tour_qr_branding).where(eq(tour_qr_branding.id, existing.id))
    }
    return
  }

  if (existing) {
    await db.update(tour_qr_branding).set({ overrides, updatedBy }).where(eq(tour_qr_branding.id, existing.id))
    return
  }

  await db.insert(tour_qr_branding).values({
    tourId,
    overrides,
    updatedBy,
  })
}

async function saveStopOverride(stopId: string, overrides: QrBrandingOverride, updatedBy: string) {
  const existing = await db.query.stop_qr_branding.findFirst({
    where: eq(stop_qr_branding.stopId, stopId),
  })

  if (isQrBrandingOverrideEmpty(overrides)) {
    if (existing) {
      await db.delete(stop_qr_branding).where(eq(stop_qr_branding.id, existing.id))
    }
    return
  }

  if (existing) {
    await db.update(stop_qr_branding).set({ overrides, updatedBy }).where(eq(stop_qr_branding.id, existing.id))
    return
  }

  await db.insert(stop_qr_branding).values({
    stopId,
    overrides,
    updatedBy,
  })
}

async function assertStopBelongsToTour(tourId: string, stopId: string): Promise<void> {
  const draftRelation = await db.query.tourStopDraft.findFirst({
    where: and(eq(tourStopDraft.tourId, tourId), eq(tourStopDraft.stopId, stopId)),
  })
  if (draftRelation) {
    return
  }

  const publishedRelation = await db.query.tourStop.findFirst({
    where: and(eq(tourStop.tourId, tourId), eq(tourStop.stopId, stopId)),
  })
  if (publishedRelation) {
    return
  }

  throw new ForbiddenError('Stop is not part of this tour')
}

function buildShortUrl(code: string): string {
  return buildShortLinkUrl(getLinksBaseUrl(), code)
}

export async function getOrganizationQrBrandingSettings(
  organizationId: string,
): Promise<OrganizationQrBrandingSettings> {
  const orgContext = await getOrganizationQrContext(organizationId)
  const override = await getOrgQrOverride(organizationId)
  const inheritedBranding = resolveQrBranding({
    logoStoragePath: orgContext.logoStoragePath,
  })
  const effectiveBranding = resolveQrBranding({
    orgOverride: override,
    logoStoragePath: orgContext.logoStoragePath,
  })

  return {
    organization: orgContext,
    linksBaseUrl: getLinksBaseUrl(),
    override,
    inheritedBranding,
    effectiveBranding,
  }
}

export async function updateOrganizationQrBrandingSettings(
  organizationId: string,
  updatedBy: string,
  override: QrBrandingOverride,
): Promise<OrganizationQrBrandingSettings> {
  const sanitized = sanitizeQrBrandingOverride(override)
  await saveOrgOverride(organizationId, sanitized, updatedBy)
  return getOrganizationQrBrandingSettings(organizationId)
}

export async function updateTourQrBrandingSettings(
  tourNanoId: string,
  updatedBy: string,
  override: QrBrandingOverride,
): Promise<TourQrCodePayload> {
  const tourContext = await getTourQrContext(tourNanoId)
  await saveTourOverride(tourContext.id, sanitizeQrBrandingOverride(override), updatedBy)
  return getOrCreateTourQrCode(tourNanoId)
}

export async function updateStopQrBrandingSettings(
  tourNanoId: string,
  stopNanoId: string,
  updatedBy: string,
  override: QrBrandingOverride,
): Promise<StopQrCodePayload> {
  const [tourContext, stopContext] = await Promise.all([getTourQrContext(tourNanoId), getStopQrContext(stopNanoId)])
  await assertStopBelongsToTour(tourContext.id, stopContext.id)
  await saveStopOverride(stopContext.id, sanitizeQrBrandingOverride(override), updatedBy)
  return getOrCreateStopQrCode(tourNanoId, stopNanoId)
}

export async function getOrCreateTourQrCode(tourNanoId: string): Promise<TourQrCodePayload> {
  const tourContext = await getTourQrContext(tourNanoId)
  const [shortLink, orgOverride, tourOverride] = await Promise.all([
    getOrCreateTourShortLink(tourNanoId, tourContext.organizationId),
    getOrgQrOverride(tourContext.organizationId),
    getTourQrOverrideByTourId(tourContext.id),
  ])

  const analytics = await getShortLinkAnalytics(shortLink.id)
  const inheritedBranding = resolveQrBranding({
    orgOverride,
    logoStoragePath: tourContext.logoStoragePath,
  })
  const effectiveBranding = resolveQrBranding({
    orgOverride,
    tourOverride,
    logoStoragePath: tourContext.logoStoragePath,
  })

  return {
    kind: 'tour',
    tourNanoId,
    shortCode: shortLink.code,
    shortUrl: buildShortUrl(shortLink.code),
    override: tourOverride,
    inheritedBranding,
    effectiveBranding,
    analytics,
  }
}

export async function getOrCreateStopQrCode(tourNanoId: string, stopNanoId: string): Promise<StopQrCodePayload> {
  const [tourContext, stopContext] = await Promise.all([getTourQrContext(tourNanoId), getStopQrContext(stopNanoId)])
  await assertStopBelongsToTour(tourContext.id, stopContext.id)

  const [shortLink, orgOverride, tourOverride, stopOverride] = await Promise.all([
    getOrCreateStopShortLink(tourNanoId, stopNanoId, tourContext.organizationId),
    getOrgQrOverride(tourContext.organizationId),
    getTourQrOverrideByTourId(tourContext.id),
    getStopQrOverrideByStopId(stopContext.id),
  ])

  const analytics = await getShortLinkAnalytics(shortLink.id)
  const inheritedBranding = resolveQrBranding({
    orgOverride,
    tourOverride,
    logoStoragePath: tourContext.logoStoragePath,
  })
  const effectiveBranding = resolveQrBranding({
    orgOverride,
    tourOverride,
    stopOverride,
    logoStoragePath: tourContext.logoStoragePath,
  })

  return {
    kind: 'stop',
    tourNanoId,
    stopNanoId,
    shortCode: shortLink.code,
    shortUrl: buildShortUrl(shortLink.code),
    override: stopOverride,
    inheritedBranding,
    effectiveBranding,
    analytics,
  }
}
