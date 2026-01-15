import { createServerFn } from '@tanstack/react-start'
import { guideAsset, stopAsset } from '@valguide/core/features/assets/schema'
import { requireGuideAccess, requireStopAccess } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
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
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      return getGuideById(db, data.guideId)
    }),
  )

const getGuideViewDataSchema = z.object({ nanoId: z.string() })

export const getGuideViewDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideViewDataSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const guideData = await getGuideViewData(data.nanoId)
      if (guideData) {
        await requireGuideAccess(guideData.id, context.user.id)
      }
      return guideData
    }),
  )

const getGuideDetailSchema = z.object({
  nanoId: z.string(),
  preferredLocale: z.string().default('de'),
})

export const getGuideDetailFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideDetailSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const guideData = await getGuideDetailByNanoId(db, data.nanoId, data.preferredLocale)
      if (guideData) {
        await requireGuideAccess(guideData.id, context.user.id)
      }
      return guideData
    }),
  )

const getStopByNanoIdQueriesSchema = z.object({ stopNanoId: z.string() })

export const getStopByNanoIdFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopByNanoIdQueriesSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const stopData = await getStopByNanoId(data.stopNanoId)
      if (stopData) {
        await requireStopAccess(stopData.id, context.user.id)
      }
      return stopData
    }),
  )

// --- translation-queries.ts wrappers ---
const getGuideTranslationHistorySchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const getGuideTranslationHistoryFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideTranslationHistorySchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      return getGuideTranslationHistory(data.guideId, data.locale)
    }),
  )

const getStopTranslationHistorySchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const getStopTranslationHistoryFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopTranslationHistorySchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireStopAccess(data.stopId, context.user.id)
      return getStopTranslationHistory(data.stopId, data.locale)
    }),
  )

// --- Lightweight editor queries (Stage 2) ---

const getGuideMetadataSchema = z.object({ nanoId: z.string() })

export const getGuideMetadataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideMetadataSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const metadata = await getGuideMetadata(data.nanoId)
      if (metadata) {
        await requireGuideAccess(metadata.id, context.user.id)
      }
      return metadata
    }),
  )

const getGuideTranslationsForLocaleSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const getGuideTranslationsForLocaleFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideTranslationsForLocaleSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      return getGuideTranslationsForLocale(data.guideId, data.locale)
    }),
  )

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
  .handler(
    handleError(async ({ context, data }) => {
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
    }),
  )

const updateGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
})

export const updateGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideTranslationSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const { guideId, locale, title, description } = data
      await requireGuideAccess(guideId, context.user.id)

      const versionId = await upsertGuideTranslationDraft(guideId, locale, { title, description })

      return { versionId }
    }),
  )

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
  .handler(
    handleError(async ({ context, data }) => {
      const { guideId, position, translations } = data
      await requireGuideAccess(guideId, context.user.id)
      const userId = context.user.id

      const [guideData] = await db
        .select({ organizationId: guide.organizationId })
        .from(guide)
        .where(eq(guide.id, guideId))
        .limit(1)

      if (!guideData) {
        throw new Error('Guide not found')
      }

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
          organizationId: guideData.organizationId,
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
    }),
  )

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
  .handler(
    handleError(async ({ context, data }) => {
      const { stopId, locale, title, description, transcription } = data
      await requireStopAccess(stopId, context.user.id)

      const versionId = await upsertStopTranslationDraft(stopId, locale, { title, description, transcription })

      return { versionId }
    }),
  )

const deleteStopSchema = z.object({
  stopId: z.string(),
})

export const deleteStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteStopSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireStopAccess(data.stopId, context.user.id)
      await db.delete(stop).where(eq(stop.id, data.stopId))

      return { success: true }
    }),
  )

const reorderStopsSchema = z.array(
  z.object({
    id: z.string(),
    order: z.number(),
  }),
)

export const reorderStopsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderStopsSchema)
  .handler(
    handleError(async ({ context, data: updates }) => {
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
    }),
  )

// Asset attachment actions

const attachAssetToGuideSchema = z.object({
  guideId: z.string(),
  assetId: z.string(),
  role: z.string(),
  locale: z.string().optional(),
  order: z.number().optional(),
})

export const attachAssetToGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(attachAssetToGuideSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const { guideId, assetId, role, locale, order = 0 } = data
      await requireGuideAccess(guideId, context.user.id)

      const [attachment] = await db
        .insert(guideAsset)
        .values({
          guideId,
          assetId,
          role,
          locale: locale || null,
          order,
        })
        .returning()

      return attachment
    }),
  )

const attachAssetToStopSchema = z.object({
  stopId: z.string(),
  assetId: z.string(),
  role: z.string(),
  locale: z.string().optional(),
  order: z.number().optional(),
})

export const attachAssetToStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(attachAssetToStopSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const { stopId, assetId, role, locale, order = 0 } = data
      await requireStopAccess(stopId, context.user.id)

      const [attachment] = await db
        .insert(stopAsset)
        .values({
          stopId,
          assetId,
          role,
          locale: locale || null,
          order,
        })
        .returning()

      return attachment
    }),
  )

const detachAssetFromGuideSchema = z.object({
  guideAssetId: z.string(),
})

export const detachAssetFromGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(detachAssetFromGuideSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const [asset] = await db
        .select({ guideId: guideAsset.guideId })
        .from(guideAsset)
        .where(eq(guideAsset.id, data.guideAssetId))
        .limit(1)

      if (!asset) {
        throw new Error('Asset attachment not found')
      }

      await requireGuideAccess(asset.guideId, context.user.id)
      await db.delete(guideAsset).where(eq(guideAsset.id, data.guideAssetId))

      return { success: true }
    }),
  )

const detachAssetFromStopSchema = z.object({
  stopAssetId: z.string(),
})

export const detachAssetFromStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(detachAssetFromStopSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const [asset] = await db
        .select({ stopId: stopAsset.stopId })
        .from(stopAsset)
        .where(eq(stopAsset.id, data.stopAssetId))
        .limit(1)

      if (!asset) {
        throw new Error('Asset attachment not found')
      }

      await requireStopAccess(asset.stopId, context.user.id)
      await db.delete(stopAsset).where(eq(stopAsset.id, data.stopAssetId))

      return { success: true }
    }),
  )

const archiveGuideSchema = z.object({
  id: z.string(),
})

export const archiveGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveGuideSchema)
  .handler(
    handleError(async ({ context, data }) => {
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
    }),
  )

const recoverGuideSchema = z.object({
  id: z.string(),
})

export const recoverGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(recoverGuideSchema)
  .handler(
    handleError(async ({ context, data }) => {
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
    }),
  )

const deleteGuideSchema = z.object({
  id: z.string(),
})

export const deleteGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteGuideSchema)
  .handler(
    handleError(async ({ context, data }) => {
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
    }),
  )

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
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      return publishDraft(data.guideId, data.locale)
    }),
  )

const publishStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const publishStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopTranslationDraftSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireStopAccess(data.stopId, context.user.id)
      return publishStopDraft(data.stopId, data.locale)
    }),
  )

const rollbackGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
})

export const rollbackGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackGuideTranslationSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      return rollbackGuide(data.guideId, data.locale, data.targetVersion, context.user.id)
    }),
  )

const rollbackStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
})

export const rollbackStopTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackStopTranslationSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireStopAccess(data.stopId, context.user.id)
      return rollbackStop(data.stopId, data.locale, data.targetVersion, context.user.id)
    }),
  )

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
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      const success = await deleteGuideTranslationDraft(data.guideId, data.locale)
      return { success }
    }),
  )

const discardStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const discardStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardStopTranslationDraftSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireStopAccess(data.stopId, context.user.id)
      const success = await deleteStopTranslationDraft(data.stopId, data.locale)
      return { success }
    }),
  )

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
  .handler(
    handleError(async ({ context, data }) => {
      await requireGuideAccess(data.guideId, context.user.id)
      return unpublishGuideTranslation(data.guideId, data.locale)
    }),
  )

const unpublishStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const unpublishStopTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishStopTranslationSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireStopAccess(data.stopId, context.user.id)
      return unpublishStopTranslation(data.stopId, data.locale)
    }),
  )
