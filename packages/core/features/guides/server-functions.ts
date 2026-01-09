import { createServerFn } from '@tanstack/react-start'
import { guideAsset, stopAsset } from '@valguide/core/features/assets/schema'
import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { createClient } from '@valguide/supabase/server'
import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { organizationMember } from '../orgs/schema'
import { getGuideById, getGuideByNanoIdWithAssets, getStopByNanoId } from './queries'
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

async function requireUser() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error('Unauthorized')
  }
  return { id: claimsData.claims.sub }
}

async function checkGuideAccess(guideId: string, userId: string) {
  const [foundGuide] = await db
    .select({ organizationId: guide.organizationId })
    .from(guide)
    .where(eq(guide.id, guideId))
    .limit(1)

  if (!foundGuide) {
    throw new Error('Guide not found')
  }

  const [membership] = await db
    .select()
    .from(organizationMember)
    .where(and(eq(organizationMember.organizationId, foundGuide.organizationId), eq(organizationMember.userId, userId)))
    .limit(1)

  if (!membership) {
    throw new Error('Unauthorized: You do not have access to this guide')
  }
}

async function requireGuideAccess(guideId: string) {
  const user = await requireUser()
  await checkGuideAccess(guideId, user.id)
  return user
}

async function requireStopAccess(stopId: string) {
  const guideStopResult = await db
    .select({ guideId: guideStop.guideId })
    .from(guideStop)
    .where(eq(guideStop.stopId, stopId))
    .limit(1)

  if (guideStopResult[0]) {
    return requireGuideAccess(guideStopResult[0].guideId)
  }

  const [foundStop] = await db.select({ guideId: stop.guideId }).from(stop).where(eq(stop.id, stopId)).limit(1)

  if (!foundStop) {
    throw new Error('Stop not found')
  }

  if (!foundStop.guideId) {
    throw new Error('Stop is not associated with any guide')
  }

  return requireGuideAccess(foundStop.guideId)
}

// ============================================================================
// Query Server Functions (GET)
// ============================================================================

// --- queries.ts wrappers ---

const getGuideByIdSchema = z.object({ guideId: z.string() })

export const getGuideByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuideByIdSchema)
  .handler(async ({ data }) => getGuideById(db, data.guideId))

const getGuideByNanoIdWithAssetsSchema = z.object({ nanoId: z.string() })

export const getGuideByNanoIdWithAssetsFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuideByNanoIdWithAssetsSchema)
  .handler(async ({ data }) => getGuideByNanoIdWithAssets(data.nanoId))

const getStopByNanoIdQueriesSchema = z.object({ stopNanoId: z.string() })

export const getStopByNanoIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getStopByNanoIdQueriesSchema)
  .handler(async ({ data }) => getStopByNanoId(data.stopNanoId))

// --- translation-queries.ts wrappers ---
const getGuideTranslationHistorySchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const getGuideTranslationHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuideTranslationHistorySchema)
  .handler(async ({ data }) => getGuideTranslationHistory(data.guideId, data.locale))

const getStopTranslationHistorySchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const getStopTranslationHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator(getStopTranslationHistorySchema)
  .handler(async ({ data }) => getStopTranslationHistory(data.stopId, data.locale))

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
  .inputValidator(updateGuideSchema)
  .handler(async ({ data }) => {
    const { id, published, organizationId, availableLocales } = data
    const user = await requireGuideAccess(id)

    const [updatedGuide] = await db
      .update(guide)
      .set({
        published: published === undefined ? undefined : published,
        organizationId: organizationId ?? undefined,
        availableLocales: availableLocales ?? undefined,
        updatedBy: user.id,
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
  .inputValidator(updateGuideTranslationSchema)
  .handler(async ({ data }) => {
    const { guideId, locale, title, description } = data
    await requireGuideAccess(guideId)

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
  .inputValidator(createStopSchema)
  .handler(async ({ data }) => {
    const { guideId, position, translations } = data
    const user = await requireGuideAccess(guideId)
    const userId = user.id

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
  })

const updateStopSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
  transcription: z.string(),
})

export const updateStopFn = createServerFn({ method: 'POST' })
  .inputValidator(updateStopSchema)
  .handler(async ({ data }) => {
    const { stopId, locale, title, description, transcription } = data
    await requireStopAccess(stopId)

    const versionId = await upsertStopTranslationDraft(stopId, locale, { title, description, transcription })

    return { versionId }
  })

const deleteStopSchema = z.object({
  stopId: z.string(),
})

export const deleteStopFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteStopSchema)
  .handler(async ({ data }) => {
    await requireStopAccess(data.stopId)
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
  .inputValidator(reorderStopsSchema)
  .handler(async ({ data: updates }) => {
    const user = await requireUser()

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
        await checkGuideAccess(gId, user.id)
      }
    }

    for (const update of updates) {
      await db.update(stop).set({ order: update.order }).where(eq(stop.id, update.id))
    }

    return { success: true }
  })

// Asset attachment actions

const attachAssetToGuideSchema = z.object({
  guideId: z.string(),
  assetId: z.string(),
  role: z.string(),
  locale: z.string().optional(),
  order: z.number().optional(),
})

export const attachAssetToGuideFn = createServerFn({ method: 'POST' })
  .inputValidator(attachAssetToGuideSchema)
  .handler(async ({ data }) => {
    const { guideId, assetId, role, locale, order = 0 } = data
    await requireGuideAccess(guideId)

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
  })

const attachAssetToStopSchema = z.object({
  stopId: z.string(),
  assetId: z.string(),
  role: z.string(),
  locale: z.string().optional(),
  order: z.number().optional(),
})

export const attachAssetToStopFn = createServerFn({ method: 'POST' })
  .inputValidator(attachAssetToStopSchema)
  .handler(async ({ data }) => {
    const { stopId, assetId, role, locale, order = 0 } = data
    await requireStopAccess(stopId)

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
  })

const detachAssetFromGuideSchema = z.object({
  guideAssetId: z.string(),
})

export const detachAssetFromGuideFn = createServerFn({ method: 'POST' })
  .inputValidator(detachAssetFromGuideSchema)
  .handler(async ({ data }) => {
    const [asset] = await db
      .select({ guideId: guideAsset.guideId })
      .from(guideAsset)
      .where(eq(guideAsset.id, data.guideAssetId))
      .limit(1)

    if (!asset) {
      throw new Error('Asset attachment not found')
    }

    await requireGuideAccess(asset.guideId)
    await db.delete(guideAsset).where(eq(guideAsset.id, data.guideAssetId))

    return { success: true }
  })

const detachAssetFromStopSchema = z.object({
  stopAssetId: z.string(),
})

export const detachAssetFromStopFn = createServerFn({ method: 'POST' })
  .inputValidator(detachAssetFromStopSchema)
  .handler(async ({ data }) => {
    const [asset] = await db
      .select({ stopId: stopAsset.stopId })
      .from(stopAsset)
      .where(eq(stopAsset.id, data.stopAssetId))
      .limit(1)

    if (!asset) {
      throw new Error('Asset attachment not found')
    }

    await requireStopAccess(asset.stopId)
    await db.delete(stopAsset).where(eq(stopAsset.id, data.stopAssetId))

    return { success: true }
  })

const archiveGuideSchema = z.object({
  id: z.string(),
})

export const archiveGuideFn = createServerFn({ method: 'POST' })
  .inputValidator(archiveGuideSchema)
  .handler(async ({ data }) => {
    const { id } = data
    const user = await requireGuideAccess(id)
    const userId = user.id

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
  .inputValidator(recoverGuideSchema)
  .handler(async ({ data }) => {
    const { id } = data
    const user = await requireGuideAccess(id)
    const userId = user.id

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
  .inputValidator(deleteGuideSchema)
  .handler(async ({ data }) => {
    const { id } = data
    const user = await requireGuideAccess(id)
    const userId = user.id

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
  .inputValidator(publishGuideTranslationDraftSchema)
  .handler(async ({ data }) => {
    return publishDraft(data.guideId, data.locale)
  })

const publishStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const publishStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(publishStopTranslationDraftSchema)
  .handler(async ({ data }) => {
    return publishStopDraft(data.stopId, data.locale)
  })

const rollbackGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
  userId: z.string().optional(),
})

export const rollbackGuideTranslationFn = createServerFn({ method: 'POST' })
  .inputValidator(rollbackGuideTranslationSchema)
  .handler(async ({ data }) => {
    return rollbackGuide(data.guideId, data.locale, data.targetVersion, data.userId)
  })

const rollbackStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
  userId: z.string().optional(),
})

export const rollbackStopTranslationFn = createServerFn({ method: 'POST' })
  .inputValidator(rollbackStopTranslationSchema)
  .handler(async ({ data }) => {
    return rollbackStop(data.stopId, data.locale, data.targetVersion, data.userId)
  })

// ============================================================================
// Discard Draft Server Functions
// ============================================================================

const discardGuideTranslationDraftSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const discardGuideTranslationDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(discardGuideTranslationDraftSchema)
  .handler(async ({ data }) => {
    const success = await deleteGuideTranslationDraft(data.guideId, data.locale)
    return { success }
  })

const discardStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const discardStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(discardStopTranslationDraftSchema)
  .handler(async ({ data }) => {
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
  .inputValidator(unpublishGuideTranslationSchema)
  .handler(async ({ data }) => {
    return unpublishGuideTranslation(data.guideId, data.locale)
  })

const unpublishStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const unpublishStopTranslationFn = createServerFn({ method: 'POST' })
  .inputValidator(unpublishStopTranslationSchema)
  .handler(async ({ data }) => {
    return unpublishStopTranslation(data.stopId, data.locale)
  })
