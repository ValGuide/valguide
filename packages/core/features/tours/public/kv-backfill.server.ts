import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { organization, organizationSlug } from '../../orgs/schema'
import { tour, tourLocale, tourSlug } from '../schema'

export type PublishedTourSummary = {
  nanoId: string
  slug: string
  orgSlug: string
  orgNanoId: string
  availableLocales: string[]
}

export type OrgSlugEntry = {
  nanoId: string
  currentSlug: string
  historicalSlugs: string[]
}

export type TourSlugEntry = {
  tourNanoId: string
  currentSlug: string
  historicalSlugs: string[]
  orgCurrentSlug: string
  orgNanoId: string
}

export async function getAllPublishedTourSummaries(): Promise<PublishedTourSummary[]> {
  return db
    .selectDistinct({
      nanoId: tour.nanoId,
      slug: tour.slug,
      orgSlug: organization.slug,
      orgNanoId: organization.nanoId,
      availableLocales: tour.availableLocales,
    })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .innerJoin(tourLocale, eq(tourLocale.tourId, tour.id))
    .where(and(isNotNull(tour.publishedAt), isNull(tour.deletedAt), isNull(tour.archivedAt)))
}

export async function getAllOrgSlugEntries(): Promise<OrgSlugEntry[]> {
  const [orgs, history] = await Promise.all([
    db.select({ id: organization.id, nanoId: organization.nanoId, currentSlug: organization.slug }).from(organization),
    db.select({ organizationId: organizationSlug.organizationId, slug: organizationSlug.slug }).from(organizationSlug),
  ])

  const historyMap = new Map<string, string[]>()
  for (const h of history) {
    const arr = historyMap.get(h.organizationId) ?? []
    arr.push(h.slug)
    historyMap.set(h.organizationId, arr)
  }

  return orgs.map((o) => ({
    nanoId: o.nanoId,
    currentSlug: o.currentSlug,
    historicalSlugs: historyMap.get(o.id) ?? [],
  }))
}

export async function getAllTourSlugEntries(): Promise<TourSlugEntry[]> {
  const [tours, history] = await Promise.all([
    db
      .select({
        tourId: tour.id,
        tourNanoId: tour.nanoId,
        currentSlug: tour.slug,
        orgCurrentSlug: organization.slug,
        orgNanoId: organization.nanoId,
      })
      .from(tour)
      .innerJoin(organization, eq(tour.organizationId, organization.id))
      .where(and(isNotNull(tour.publishedAt), isNull(tour.deletedAt), isNull(tour.archivedAt))),
    db.select({ tourId: tourSlug.tourId, slug: tourSlug.slug }).from(tourSlug),
  ])

  const historyMap = new Map<string, string[]>()
  for (const h of history) {
    const arr = historyMap.get(h.tourId) ?? []
    arr.push(h.slug)
    historyMap.set(h.tourId, arr)
  }

  return tours.map((t) => ({
    tourNanoId: t.tourNanoId,
    currentSlug: t.currentSlug,
    historicalSlugs: historyMap.get(t.tourId) ?? [],
    orgCurrentSlug: t.orgCurrentSlug,
    orgNanoId: t.orgNanoId,
  }))
}

export async function getOrgSlugEntriesForOrg(orgNanoId: string): Promise<OrgSlugEntry | null> {
  const [org] = await db
    .select({ id: organization.id, nanoId: organization.nanoId, currentSlug: organization.slug })
    .from(organization)
    .where(eq(organization.nanoId, orgNanoId))
    .limit(1)

  if (!org) return null

  const history = await db
    .select({ slug: organizationSlug.slug })
    .from(organizationSlug)
    .where(eq(organizationSlug.organizationId, org.id))

  return {
    nanoId: org.nanoId,
    currentSlug: org.currentSlug,
    historicalSlugs: history.map((h) => h.slug),
  }
}

export async function getTourSlugEntriesForOrg(orgNanoId: string): Promise<TourSlugEntry[]> {
  const [org] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.nanoId, orgNanoId))
    .limit(1)

  if (!org) return []

  const [tours, history] = await Promise.all([
    db
      .select({
        tourId: tour.id,
        tourNanoId: tour.nanoId,
        currentSlug: tour.slug,
        orgCurrentSlug: organization.slug,
        orgNanoId: organization.nanoId,
      })
      .from(tour)
      .innerJoin(organization, eq(tour.organizationId, organization.id))
      .where(
        and(
          eq(tour.organizationId, org.id),
          isNotNull(tour.publishedAt),
          isNull(tour.deletedAt),
          isNull(tour.archivedAt),
        ),
      ),
    db
      .select({ tourId: tourSlug.tourId, slug: tourSlug.slug })
      .from(tourSlug)
      .innerJoin(tour, eq(tourSlug.tourId, tour.id))
      .where(eq(tour.organizationId, org.id)),
  ])

  const historyMap = new Map<string, string[]>()
  for (const h of history) {
    const arr = historyMap.get(h.tourId) ?? []
    arr.push(h.slug)
    historyMap.set(h.tourId, arr)
  }

  return tours.map((t) => ({
    tourNanoId: t.tourNanoId,
    currentSlug: t.currentSlug,
    historicalSlugs: historyMap.get(t.tourId) ?? [],
    orgCurrentSlug: t.orgCurrentSlug,
    orgNanoId: t.orgNanoId,
  }))
}

export async function getTourSlugEntriesForTour(tourNanoId: string): Promise<TourSlugEntry | null> {
  const [result] = await db
    .select({
      tourId: tour.id,
      tourNanoId: tour.nanoId,
      currentSlug: tour.slug,
      orgCurrentSlug: organization.slug,
      orgNanoId: organization.nanoId,
    })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!result) return null

  const history = await db.select({ slug: tourSlug.slug }).from(tourSlug).where(eq(tourSlug.tourId, result.tourId))

  return {
    tourNanoId: result.tourNanoId,
    currentSlug: result.currentSlug,
    historicalSlugs: history.map((h) => h.slug),
    orgCurrentSlug: result.orgCurrentSlug,
    orgNanoId: result.orgNanoId,
  }
}
