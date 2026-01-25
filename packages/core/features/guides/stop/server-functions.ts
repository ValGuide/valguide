import { createServerFn } from '@tanstack/react-start'
import {
  publishStopAssetVersion,
  upsertStopAssetVersionDraft,
} from '@valguide/core/features/assets/asset-version-mutations'
import {
  NotFoundError,
  requireGuideAccess,
  requireStopAccess,
  requireStopAccessByNanoId,
} from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { guideStop, stop } from '../schema'
import { upsertStopTranslationDraft } from '../translation/internal-mutations'
import { getStopByNanoId } from './internal-queries'

// ============================================================================
// Query Server Functions (GET)
// ============================================================================

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

// ============================================================================
// Stop CRUD Server Functions
// ============================================================================

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

// ============================================================================
// Stop Asset Version Server Functions
// ============================================================================

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
