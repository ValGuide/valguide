import { createServerFn } from '@tanstack/react-start'
import {
  publishGuideAssetVersion,
  upsertGuideAssetVersionDraft,
} from '@valguide/core/features/assets/asset-version-mutations'
import { NotFoundError, requireGuideAccess } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { getGuideDetailByNanoId, getGuideMetadata, getGuideTranslationsForLocale } from '../internal/queries'
import { guide } from '../schema'

// ============================================================================
// Query Server Functions (GET)
// ============================================================================

const getGuideDetailSchema = z.object({
  nanoId: z.string(),
  preferredLocale: z.string().default('de'),
})

export const getGuideDetailFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideDetailSchema)
  .handler(async ({ context, data }) => {
    const guideData = await getGuideDetailByNanoId(db, data.nanoId, data.preferredLocale)
    if (guideData) {
      await requireGuideAccess(guideData.id, context.user.id)
      return guideData
    }
    throw new NotFoundError('Guide not found')
  })

const getGuideMetadataSchema = z.object({ nanoId: z.string() })

export const getGuideMetadataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideMetadataSchema)
  .handler(async ({ context, data }) => {
    const metadata = await getGuideMetadata(data.nanoId)
    if (metadata) {
      await requireGuideAccess(metadata.id, context.user.id)
      return metadata
    }
    throw new NotFoundError('Guide not found')
  })

const getGuideTranslationsForLocaleSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const getGuideTranslationsForLocaleFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideTranslationsForLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return getGuideTranslationsForLocale(data.guideId, data.locale)
  })

// ============================================================================
// Guide CRUD Server Functions
// ============================================================================

const updateGuideSchema = z.object({
  id: z.string(),
  published: z.date().nullable().optional(),
  organizationId: z.string().nullable().optional(),
  availableLocales: z.array(z.string()).optional(),
})

export const updateGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideSchema)
  .handler(async ({ context, data }) => {
    const { id, published, organizationId, availableLocales } = data
    await requireGuideAccess(id, context.user.id)

    const [updatedGuide] = await db
      .update(guide)
      .set({
        published: published === undefined ? undefined : published,
        organizationId: organizationId ?? undefined,
        availableLocales: availableLocales ?? undefined,
        updatedBy: context.user.id,
        updatedAt: new Date(),
      })
      .where(eq(guide.id, id))
      .returning()

    return updatedGuide
  })

// ============================================================================
// Guide-Level Publish/Unpublish (visibility to visitors)
// ============================================================================

// ============================================================================
// Guide Archive/Recover
// ============================================================================

const archiveGuideSchema = z.object({
  id: z.string(),
})

export const archiveGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveGuideSchema)
  .handler(async ({ context, data }) => {
    const { id } = data
    await requireGuideAccess(id, context.user.id)
    const userId = context.user.id

    const [archivedGuide] = await db
      .update(guide)
      .set({
        archivedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(guide.id, id))
      .returning()

    return archivedGuide
  })

const recoverGuideSchema = z.object({
  id: z.string(),
})

export const recoverGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(recoverGuideSchema)
  .handler(async ({ context, data }) => {
    const { id } = data
    await requireGuideAccess(id, context.user.id)
    const userId = context.user.id

    const [recoveredGuide] = await db
      .update(guide)
      .set({
        archivedAt: null,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(guide.id, id), isNotNull(guide.archivedAt), isNull(guide.deletedAt)))
      .returning()

    return recoveredGuide
  })

const deleteGuideSchema = z.object({
  id: z.string(),
})

export const deleteGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteGuideSchema)
  .handler(async ({ context, data }) => {
    const { id } = data
    await requireGuideAccess(id, context.user.id)
    const userId = context.user.id

    const [deletedGuide] = await db
      .update(guide)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(guide.id, id), isNotNull(guide.archivedAt)))
      .returning()

    return deletedGuide
  })

// ============================================================================
// Guide Asset Version Server Functions
// ============================================================================

const saveGuideAssetsDraftSchema = z.object({
  guideId: z.string(),
  assets: z.array(
    z.object({
      assetId: z.string(),
      order: z.number(),
      role: z.string(),
      locale: z.string().nullable().optional(),
    }),
  ),
})

export const saveGuideAssetsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(saveGuideAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    const versionId = await upsertGuideAssetVersionDraft(data.guideId, data.assets, context.user.id)
    return { success: true, versionId }
  })

const publishGuideAssetsSchema = z.object({
  guideId: z.string(),
})

export const publishGuideAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return publishGuideAssetVersion(data.guideId)
  })
