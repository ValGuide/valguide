import { asset } from '@valguide/core/features/assets/schema'
import type { DB } from '@valguide/core/features/db'
import { organization } from '@valguide/core/features/orgs/schema'
import { tour, tourAssetDraft, tourLocaleDraft, tourSlug, tourStopDraft } from '@valguide/core/features/tours/schema'
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm'

export type AdminTourListItem = {
  nanoId: string
  title: string | null
  organizationName: string
  status: 'draft' | 'published' | 'archived'
  availableLocales: string[]
  slugs: string[]
  stopCount: number
  createdAt: Date
  publishedAt: Date | null
  coverStoragePath: string | null
}

export type ListToursInput = {
  page: number
  pageSize: number
  search?: string
  status?: 'draft' | 'published' | 'archived'
  organizationNames?: string[]
  sortBy: 'title' | 'organizationName' | 'stopCount' | 'createdAt' | 'publishedAt'
  sortOrder: 'asc' | 'desc'
}

export type ListToursResult = {
  tours: AdminTourListItem[]
  totalCount: number
  page: number
  pageSize: number
}

function deriveTourStatus(row: {
  publishedAt: Date | null
  archivedAt: Date | null
}): 'draft' | 'published' | 'archived' {
  if (row.archivedAt) return 'archived'
  if (row.publishedAt) return 'published'
  return 'draft'
}

export async function listTours(dbClient: DB, input: ListToursInput): Promise<ListToursResult> {
  const { page, pageSize, search, status, organizationNames, sortBy, sortOrder } = input

  const conditions = [isNull(tour.deletedAt)]

  if (status === 'draft') {
    conditions.push(isNull(tour.publishedAt))
    conditions.push(isNull(tour.archivedAt))
  } else if (status === 'published') {
    conditions.push(isNotNull(tour.publishedAt))
    conditions.push(isNull(tour.archivedAt))
  } else if (status === 'archived') {
    conditions.push(isNotNull(tour.archivedAt))
  }

  if (organizationNames?.length) {
    conditions.push(inArray(organization.name, organizationNames))
  }

  if (search) {
    const pattern = `%${search}%`
    const slugMatch = sql`EXISTS (SELECT 1 FROM ${tourSlug} WHERE ${tourSlug.tourId} = ${tour.id} AND ${tourSlug.slug} ILIKE ${pattern})`
    conditions.push(
      or(
        ilike(tourLocaleDraft.title, pattern),
        ilike(organization.name, pattern),
        ilike(tour.slug, pattern),
        slugMatch,
      )!,
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const stopCountSubquery = dbClient.$count(tourStopDraft, eq(tourStopDraft.tourId, tour.id))

  const coverImageSubquery = dbClient
    .select({ storagePath: asset.storagePath })
    .from(tourAssetDraft)
    .innerJoin(asset, eq(tourAssetDraft.assetId, asset.id))
    .where(and(eq(tourAssetDraft.tourId, tour.id), eq(tourAssetDraft.channel, 'images.hero')))
    .limit(1)
    .as('cover_image')

  const direction = sortOrder === 'asc' ? asc : desc
  const orderClauses = (() => {
    switch (sortBy) {
      case 'title':
        return [
          sortOrder === 'asc'
            ? asc(sql`${tourLocaleDraft.title} IS NULL`)
            : desc(sql`${tourLocaleDraft.title} IS NOT NULL`),
          direction(tourLocaleDraft.title),
        ]
      case 'organizationName':
        return [direction(organization.name)]
      case 'stopCount':
        return [direction(stopCountSubquery)]
      case 'createdAt':
        return [direction(tour.createdAt)]
      case 'publishedAt':
        return [direction(tour.publishedAt)]
    }
  })()

  const [rows, [countResult]] = await Promise.all([
    dbClient
      .select({
        nanoId: tour.nanoId,
        tourId: tour.id,
        slug: tour.slug,
        title: tourLocaleDraft.title,
        organizationName: organization.name,
        availableLocales: tour.availableLocales,
        publishedAt: tour.publishedAt,
        archivedAt: tour.archivedAt,
        createdAt: tour.createdAt,
        stopCount: stopCountSubquery,
        coverStoragePath: coverImageSubquery.storagePath,
      })
      .from(tour)
      .innerJoin(organization, eq(tour.organizationId, organization.id))
      .leftJoin(
        tourLocaleDraft,
        and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, sql`${tour.availableLocales}[1]`)),
      )
      .leftJoinLateral(coverImageSubquery, sql`true`)
      .where(whereClause)
      .orderBy(...orderClauses)
      .limit(pageSize)
      .offset(page * pageSize),
    dbClient
      .select({ total: count() })
      .from(tour)
      .innerJoin(organization, eq(tour.organizationId, organization.id))
      .leftJoin(
        tourLocaleDraft,
        and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, sql`${tour.availableLocales}[1]`)),
      )
      .where(whereClause),
  ])

  const tourIds = rows.map((r) => r.tourId)
  const historicalSlugs =
    tourIds.length > 0
      ? await dbClient
          .select({ tourId: tourSlug.tourId, slug: tourSlug.slug })
          .from(tourSlug)
          .where(inArray(tourSlug.tourId, tourIds))
      : []

  const slugsByTourId = new Map<string, string[]>()
  for (const hs of historicalSlugs) {
    const existing = slugsByTourId.get(hs.tourId) ?? []
    existing.push(hs.slug)
    slugsByTourId.set(hs.tourId, existing)
  }

  return {
    tours: rows.map((row) => {
      const historical = slugsByTourId.get(row.tourId) ?? []
      const allSlugs = [row.slug, ...historical.filter((s) => s !== row.slug)]
      return {
        nanoId: row.nanoId,
        title: row.title,
        organizationName: row.organizationName,
        status: deriveTourStatus(row),
        availableLocales: row.availableLocales,
        slugs: allSlugs,
        stopCount: row.stopCount,
        createdAt: row.createdAt,
        publishedAt: row.publishedAt,
        coverStoragePath: row.coverStoragePath,
      }
    }),
    totalCount: countResult?.total ?? 0,
    page,
    pageSize,
  }
}
