import { createServerFn } from '@tanstack/react-start'
import {
  discardGuideAssetVersionDraft,
  discardStopAssetVersionDraft,
  publishGuideAssetVersion,
  publishStopAssetVersion,
  unpublishGuideAssetVersion,
  unpublishStopAssetVersion,
  upsertGuideAssetVersionDraft,
  upsertStopAssetVersionDraft,
} from '@valguide/core/features/assets/asset-version-mutations'
import {
  getGuideAssetsByVersion,
  getGuideAssetVersionInfo,
  getStopAssetsByVersion,
  getStopAssetVersionInfo,
} from '@valguide/core/features/assets/asset-version-queries'

import {
  NotFoundError,
  requireGuideAccess,
  requireStopAccess,
  requireStopAccessByNanoId,
} from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import { z } from 'zod'
import {
  getGuideById,
  getGuideDetailByNanoId,
  getGuideMetadata,
  getGuideTranslationsForLocale,
  getGuideViewData,
  getStopByNanoId,
} from './queries'
import { guide, guideStop, stop } from './schema'
import {
  deleteGuideTranslationDraft,
  deleteStopTranslationDraft,
  publishGuideTranslationDraft as publishDraft,
  publishStopTranslationDraft as publishStopDraft,
  rollbackGuideTranslation as rollbackGuide,
  rollbackStopTranslation as rollbackStop,
  unpublishGuideTranslation,
  unpublishStopTranslation,
  upsertGuideTranslationDraft,
  upsertStopTranslationDraft,
} from './translation-mutations'
import { getGuideTranslationHistory, getStopTranslationHistory } from './translation-queries'

// ============================================================================
// Query Server Functions (GET)
// ============================================================================

// --- queries.ts wrappers ---

const getGuideByIdSchema = z.object({ guideId: z.string() })

export const getGuideByIdFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideByIdSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return getGuideById(db, data.guideId)
  })

const getGuideViewDataSchema = z.object({ nanoId: z.string() })

export const getGuideViewDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideViewDataSchema)
  .handler(async ({ context, data }) => {
    const guideData = await getGuideViewData(data.nanoId)
    if (guideData) {
      await requireGuideAccess(guideData.id, context.user.id)
      return guideData
    }

    throw new NotFoundError('Guide not found')
  })

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

const getStopByNanoIdQueriesSchema = z.object({ stopNanoId: z.string() })

export const getStopByNanoIdFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopByNanoIdQueriesSchema)
  .handler(async ({ context, data }) => {
    const stopData = await getStopByNanoId(data.stopNanoId)
    if (stopData) {
      await requireStopAccess(stopData.id, context.user.id)
      return stopData
    }
    throw new NotFoundError('Stop not found')
  })

// --- translation-queries.ts wrappers ---
const getGuideTranslationHistorySchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const getGuideTranslationHistoryFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideTranslationHistorySchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return getGuideTranslationHistory(data.guideId, data.locale)
  })

const getStopTranslationHistorySchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const getStopTranslationHistoryFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopTranslationHistorySchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return getStopTranslationHistory(data.stopId, data.locale)
  })

// --- Lightweight editor queries (Stage 2) ---

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
// Mutation Server Functions (POST) - from actions.ts
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

const updateGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
})

export const updateGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideTranslationSchema)
  .handler(async ({ context, data }) => {
    const { guideId, locale, title, description } = data
    await requireGuideAccess(guideId, context.user.id)

    const versionId = await upsertGuideTranslationDraft(guideId, locale, { title, description })

    return { versionId }
  })

// Stop actions

const createStopSchema = z.object({
  guideId: z.string(),
  position: z.number().optional(),
  translations: z.array(
    z.object({
      locale: z.string(),
      title: z.string(),
      description: z.string(),
      transcription: z.string(),
    }),
  ),
})

export const createStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createStopSchema)
  .handler(async ({ context, data }) => {
    const { guideId, position, translations } = data
    const { organizationId } = await requireGuideAccess(guideId, context.user.id)
    const userId = context.user.id

    let finalPosition = position
    if (finalPosition === undefined) {
      const existingStops = await db
        .select({ position: guideStop.position })
        .from(guideStop)
        .where(eq(guideStop.guideId, guideId))

      const maxPosition = existingStops.length > 0 ? Math.max(...existingStops.map((s) => s.position)) : -1
      finalPosition = maxPosition + 1
    }

    const nanoId = valguideId()

    const [newStop] = await db
      .insert(stop)
      .values({
        organizationId,
        nanoId,
        createdBy: userId,
        guideId,
        order: finalPosition,
      })
      .returning()

    if (!newStop) {
      throw new Error('Failed to create stop')
    }

    await db.insert(guideStop).values({
      guideId,
      stopId: newStop.id,
      position: finalPosition,
    })

    for (const trans of translations) {
      await upsertStopTranslationDraft(
        newStop.id,
        trans.locale,
        {
          title: trans.title,
          description: trans.description,
          transcription: trans.transcription,
        },
        userId,
      )
    }

    const fullStop = await db.query.stop.findFirst({
      where: eq(stop.id, newStop.id),
      with: {
        translations: {
          with: {
            draftVersion: true,
            currentVersion: true,
          },
        },
      },
    })

    if (!fullStop) {
      throw new Error('Failed to fetch created stop')
    }

    return fullStop
  })

const updateStopSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
  transcription: z.string(),
})

export const updateStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId, locale, title, description, transcription } = data
    await requireStopAccess(stopId, context.user.id)

    const versionId = await upsertStopTranslationDraft(stopId, locale, { title, description, transcription })

    return { versionId }
  })

const updateStopByNanoIdSchema = z.object({
  stopNanoId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
  transcription: z.string(),
})

export const updateStopByNanoIdFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopByNanoIdSchema)
  .handler(async ({ context, data }) => {
    const { stopNanoId, locale, title, description, transcription } = data
    const { stopId } = await requireStopAccessByNanoId(stopNanoId, context.user.id)

    const versionId = await upsertStopTranslationDraft(stopId, locale, { title, description, transcription })

    return { versionId }
  })

const updateStopAvailableLocalesSchema = z.object({
  stopId: z.string(),
  availableLocales: z.array(z.string()),
})

export const updateStopAvailableLocalesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopAvailableLocalesSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    await db.update(stop).set({ availableLocales: data.availableLocales }).where(eq(stop.id, data.stopId))
    return { success: true }
  })

const deleteStopSchema = z.object({
  stopId: z.string(),
})

export const deleteStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteStopSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    await db.delete(stop).where(eq(stop.id, data.stopId))

    return { success: true }
  })

const reorderStopsSchema = z.array(
  z.object({
    id: z.string(),
    order: z.number(),
  }),
)

export const reorderStopsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderStopsSchema)
  .handler(async ({ context, data: updates }) => {
    if (updates.length > 0) {
      const stopIds = updates.map((u) => u.id)
      const stopsToCheck = await db
        .select({ id: stop.id, guideId: stop.guideId })
        .from(stop)
        .where(inArray(stop.id, stopIds))

      const guideIds: string[] = Array.from(
        new Set(stopsToCheck.filter((s) => s.guideId != null).map((s) => s.guideId as string)),
      )
      for (const gId of guideIds) {
        await requireGuideAccess(gId, context.user.id)
      }
    }

    for (const update of updates) {
      await db.update(stop).set({ order: update.order }).where(eq(stop.id, update.id))
    }

    return { success: true }
  })

// ============================================================================
// Guide-Level Publish/Unpublish (visibility to visitors)
// ============================================================================

const publishGuideSchema = z.object({
  guideId: z.string(),
})

export const publishGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideSchema)
  .handler(async ({ context, data }) => {
    const { guideId } = data
    await requireGuideAccess(guideId, context.user.id)

    const [publishedGuide] = await db
      .update(guide)
      .set({
        published: new Date(),
        updatedBy: context.user.id,
        updatedAt: new Date(),
      })
      .where(and(eq(guide.id, guideId), isNull(guide.archivedAt), isNull(guide.deletedAt)))
      .returning()

    return publishedGuide
  })

const unpublishGuideSchema = z.object({
  guideId: z.string(),
})

export const unpublishGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishGuideSchema)
  .handler(async ({ context, data }) => {
    const { guideId } = data
    await requireGuideAccess(guideId, context.user.id)

    const [unpublishedGuide] = await db
      .update(guide)
      .set({
        published: null,
        updatedBy: context.user.id,
        updatedAt: new Date(),
      })
      .where(and(eq(guide.id, guideId), isNull(guide.archivedAt), isNull(guide.deletedAt)))
      .returning()

    return unpublishedGuide
  })

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
// Mutation Server Functions (POST) - from translation-actions.ts
// ============================================================================

const publishGuideTranslationDraftSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const publishGuideTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return publishDraft(data.guideId, data.locale)
  })

const publishStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const publishStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return publishStopDraft(data.stopId, data.locale)
  })

const rollbackGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
})

export const rollbackGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackGuideTranslationSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return rollbackGuide(data.guideId, data.locale, data.targetVersion, context.user.id)
  })

const rollbackStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
})

export const rollbackStopTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackStopTranslationSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return rollbackStop(data.stopId, data.locale, data.targetVersion, context.user.id)
  })

// ============================================================================
// Discard Draft Server Functions
// ============================================================================

const discardGuideTranslationDraftSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const discardGuideTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardGuideTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    const success = await deleteGuideTranslationDraft(data.guideId, data.locale)
    return { success }
  })

const discardStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const discardStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardStopTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    const success = await deleteStopTranslationDraft(data.stopId, data.locale)
    return { success }
  })

// ============================================================================
// Unpublish Server Functions
// ============================================================================

const unpublishGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const unpublishGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishGuideTranslationSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return unpublishGuideTranslation(data.guideId, data.locale)
  })

const unpublishStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const unpublishStopTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishStopTranslationSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return unpublishStopTranslation(data.stopId, data.locale)
  })

// ============================================================================
// Stop Visibility (Hide/Show)
// ============================================================================

const hideStopSchema = z.object({
  guideId: z.string(),
  stopId: z.string(),
})

export const hideStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(hideStopSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)

    const [updatedGuideStop] = await db
      .update(guideStop)
      .set({ visible: false })
      .where(and(eq(guideStop.guideId, data.guideId), eq(guideStop.stopId, data.stopId)))
      .returning()

    return updatedGuideStop
  })

const showStopSchema = z.object({
  guideId: z.string(),
  stopId: z.string(),
})

export const showStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(showStopSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)

    const [updatedGuideStop] = await db
      .update(guideStop)
      .set({ visible: true })
      .where(and(eq(guideStop.guideId, data.guideId), eq(guideStop.stopId, data.stopId)))
      .returning()

    return updatedGuideStop
  })

// ============================================================================
// Stop Remove/Restore
// ============================================================================

const removeStopFromGuideSchema = z.object({
  guideId: z.string(),
  stopId: z.string(),
})

export const removeStopFromGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeStopFromGuideSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)

    await db.delete(guideStop).where(and(eq(guideStop.guideId, data.guideId), eq(guideStop.stopId, data.stopId)))

    return { success: true }
  })

const restoreStopSchema = z.object({
  guideId: z.string(),
  stopId: z.string(),
})

export const restoreStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(restoreStopSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)

    const [restoredGuideStop] = await db
      .update(guideStop)
      .set({ archivedAt: null })
      .where(and(eq(guideStop.guideId, data.guideId), eq(guideStop.stopId, data.stopId)))
      .returning()

    return restoredGuideStop
  })

// ============================================================================
// Asset Version Server Functions
// ============================================================================

// --- Guide Asset Versions ---

const getGuideAssetsByVersionSchema = z.object({
  guideId: z.string(),
  version: z.enum(['draft', 'published']),
})

export const getGuideAssetsByVersionFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideAssetsByVersionSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return getGuideAssetsByVersion(data.guideId, data.version)
  })

const getGuideAssetVersionInfoSchema = z.object({
  guideId: z.string(),
})

export const getGuideAssetVersionInfoFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideAssetVersionInfoSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return getGuideAssetVersionInfo(data.guideId)
  })

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

const discardGuideAssetsDraftSchema = z.object({
  guideId: z.string(),
})

export const discardGuideAssetsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardGuideAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    const success = await discardGuideAssetVersionDraft(data.guideId)
    return { success }
  })

const unpublishGuideAssetsSchema = z.object({
  guideId: z.string(),
})

export const unpublishGuideAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishGuideAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return unpublishGuideAssetVersion(data.guideId, context.user.id)
  })

// --- Stop Asset Versions ---

const getStopAssetsByVersionSchema = z.object({
  stopId: z.string(),
  version: z.enum(['draft', 'published']),
})

export const getStopAssetsByVersionFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopAssetsByVersionSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return getStopAssetsByVersion(data.stopId, data.version)
  })

const getStopAssetVersionInfoSchema = z.object({
  stopId: z.string(),
})

export const getStopAssetVersionInfoFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopAssetVersionInfoSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return getStopAssetVersionInfo(data.stopId)
  })

const saveStopAssetsDraftSchema = z.object({
  stopId: z.string(),
  assets: z.array(
    z.object({
      assetId: z.string(),
      order: z.number(),
      role: z.string(),
      locale: z.string().nullable().optional(),
    }),
  ),
})

export const saveStopAssetsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(saveStopAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    const versionId = await upsertStopAssetVersionDraft(data.stopId, data.assets, context.user.id)
    return { success: true, versionId }
  })

const publishStopAssetsSchema = z.object({
  stopId: z.string(),
})

export const publishStopAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return publishStopAssetVersion(data.stopId)
  })

const discardStopAssetsDraftSchema = z.object({
  stopId: z.string(),
})

export const discardStopAssetsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardStopAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    const success = await discardStopAssetVersionDraft(data.stopId)
    return { success }
  })

const unpublishStopAssetsSchema = z.object({
  stopId: z.string(),
})

export const unpublishStopAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishStopAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return unpublishStopAssetVersion(data.stopId, context.user.id)
  })
