import { db } from '@valguide/core/features/db'
import { eq, max } from 'drizzle-orm'
import { guide, stop } from '../guides/schema'
import { guideAsset, guideAssetVersion, stopAsset, stopAssetVersion } from './schema'

type AssetInput = {
  assetId: string
  order: number
  role: string
  locale?: string | null
}

// ============================================================================
// Guide Asset Version Mutations
// ============================================================================

/**
 * Create or update a draft guide asset version
 * If no draft exists, creates a new version
 * If draft exists, replaces its items
 */
export async function upsertGuideAssetVersionDraft(
  guideId: string,
  assets: AssetInput[],
  userId: string,
): Promise<string> {
  return db.transaction(async (tx) => {
    // Get current draft pointer
    const guideData = await tx.query.guide.findFirst({
      where: eq(guide.id, guideId),
      columns: { draftAssetVersionId: true },
    })

    let versionId = guideData?.draftAssetVersionId

    if (!versionId) {
      // Get next version number
      const maxVersionResult = await tx
        .select({ maxVer: max(guideAsset.version) })
        .from(guideAsset)
        .where(eq(guideAsset.guideId, guideId))

      const nextVersion = (maxVersionResult[0]?.maxVer ?? 0) + 1

      // Create new draft version
      const [newVersion] = await tx
        .insert(guideAsset)
        .values({
          guideId,
          version: nextVersion,
          createdBy: userId,
        })
        .returning()

      if (!newVersion) {
        throw new Error('Failed to create guide asset version')
      }

      versionId = newVersion.id

      // Update guide pointer to new draft
      await tx.update(guide).set({ draftAssetVersionId: versionId }).where(eq(guide.id, guideId))
    } else {
      // Clear existing items in draft version
      await tx.delete(guideAssetVersion).where(eq(guideAssetVersion.guideAssetId, versionId))
    }

    // Insert new items
    if (assets.length > 0 && versionId) {
      const currentVersionId = versionId
      await tx.insert(guideAssetVersion).values(
        assets.map((a) => ({
          guideAssetId: currentVersionId,
          assetId: a.assetId,
          order: a.order,
          role: a.role,
          locale: a.locale ?? null,
        })),
      )
    }

    if (!versionId) {
      throw new Error('Failed to create or find guide asset version')
    }

    return versionId
  })
}

/**
 * Publish guide asset draft
 * Sets publishedAt, promotes draft to current, clears draft pointer
 */
export async function publishGuideAssetVersion(guideId: string): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const guideData = await tx.query.guide.findFirst({
      where: eq(guide.id, guideId),
      columns: { draftAssetVersionId: true },
    })

    if (!guideData?.draftAssetVersionId) {
      return { success: false, error: 'No draft assets to publish' }
    }

    const draftId = guideData.draftAssetVersionId

    // Mark version as published
    await tx.update(guideAsset).set({ publishedAt: new Date() }).where(eq(guideAsset.id, draftId))

    // Update pointers: draft becomes current, clear draft
    await tx
      .update(guide)
      .set({
        currentAssetVersionId: draftId,
        draftAssetVersionId: null,
      })
      .where(eq(guide.id, guideId))

    return { success: true }
  })
}

/**
 * Discard guide asset draft
 * Deletes the draft version and clears the pointer
 */
export async function discardGuideAssetVersionDraft(guideId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const guideData = await tx.query.guide.findFirst({
      where: eq(guide.id, guideId),
      columns: { draftAssetVersionId: true },
    })

    if (!guideData?.draftAssetVersionId) {
      return false
    }

    // Delete draft version (cascades to items)
    await tx.delete(guideAsset).where(eq(guideAsset.id, guideData.draftAssetVersionId))

    // Clear pointer
    await tx.update(guide).set({ draftAssetVersionId: null }).where(eq(guide.id, guideId))

    return true
  })
}

/**
 * Unpublish guide assets
 * Creates a draft from current published, clears current pointer
 */
export async function unpublishGuideAssetVersion(
  guideId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const guideData = await tx.query.guide.findFirst({
      where: eq(guide.id, guideId),
      columns: { currentAssetVersionId: true, draftAssetVersionId: true },
    })

    if (!guideData?.currentAssetVersionId) {
      return { success: false, error: 'No published assets to unpublish' }
    }

    // If no draft exists, create one from the published version's items
    if (!guideData.draftAssetVersionId) {
      const currentItems = await tx.query.guideAssetVersion.findMany({
        where: eq(guideAssetVersion.guideAssetId, guideData.currentAssetVersionId),
      })

      // Get next version number
      const maxVersionResult = await tx
        .select({ maxVer: max(guideAsset.version) })
        .from(guideAsset)
        .where(eq(guideAsset.guideId, guideId))

      const nextVersion = (maxVersionResult[0]?.maxVer ?? 0) + 1

      // Create new draft version with same items
      const [newDraft] = await tx
        .insert(guideAsset)
        .values({
          guideId,
          version: nextVersion,
          createdBy: userId,
        })
        .returning()

      if (newDraft && currentItems.length > 0) {
        await tx.insert(guideAssetVersion).values(
          currentItems.map((item) => ({
            guideAssetId: newDraft.id,
            assetId: item.assetId,
            order: item.order,
            role: item.role,
            locale: item.locale,
          })),
        )
      }

      // Update pointers
      await tx
        .update(guide)
        .set({
          currentAssetVersionId: null,
          draftAssetVersionId: newDraft?.id ?? null,
        })
        .where(eq(guide.id, guideId))
    } else {
      // Draft exists, just clear current pointer
      await tx.update(guide).set({ currentAssetVersionId: null }).where(eq(guide.id, guideId))
    }

    return { success: true }
  })
}

// ============================================================================
// Stop Asset Version Mutations
// ============================================================================

/**
 * Create or update a draft stop asset version
 */
export async function upsertStopAssetVersionDraft(
  stopId: string,
  assets: AssetInput[],
  userId: string,
): Promise<string> {
  return db.transaction(async (tx) => {
    // Get current draft pointer
    const stopData = await tx.query.stop.findFirst({
      where: eq(stop.id, stopId),
      columns: { draftAssetVersionId: true },
    })

    let versionId = stopData?.draftAssetVersionId

    if (!versionId) {
      // Get next version number
      const maxVersionResult = await tx
        .select({ maxVer: max(stopAsset.version) })
        .from(stopAsset)
        .where(eq(stopAsset.stopId, stopId))

      const nextVersion = (maxVersionResult[0]?.maxVer ?? 0) + 1

      // Create new draft version
      const [newVersion] = await tx
        .insert(stopAsset)
        .values({
          stopId,
          version: nextVersion,
          createdBy: userId,
        })
        .returning()

      if (!newVersion) {
        throw new Error('Failed to create stop asset version')
      }

      versionId = newVersion.id

      // Update stop pointer to new draft
      await tx.update(stop).set({ draftAssetVersionId: versionId }).where(eq(stop.id, stopId))
    } else {
      // Clear existing items in draft version
      await tx.delete(stopAssetVersion).where(eq(stopAssetVersion.stopAssetId, versionId))
    }

    // Insert new items
    if (assets.length > 0 && versionId) {
      const currentVersionId = versionId
      await tx.insert(stopAssetVersion).values(
        assets.map((a) => ({
          stopAssetId: currentVersionId,
          assetId: a.assetId,
          order: a.order,
          role: a.role,
          locale: a.locale ?? null,
        })),
      )
    }

    if (!versionId) {
      throw new Error('Failed to create or find stop asset version')
    }

    return versionId
  })
}

/**
 * Publish stop asset draft
 */
export async function publishStopAssetVersion(stopId: string): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const stopData = await tx.query.stop.findFirst({
      where: eq(stop.id, stopId),
      columns: { draftAssetVersionId: true },
    })

    if (!stopData?.draftAssetVersionId) {
      return { success: false, error: 'No draft assets to publish' }
    }

    const draftId = stopData.draftAssetVersionId

    // Mark version as published
    await tx.update(stopAsset).set({ publishedAt: new Date() }).where(eq(stopAsset.id, draftId))

    // Update pointers: draft becomes current, clear draft
    await tx
      .update(stop)
      .set({
        currentAssetVersionId: draftId,
        draftAssetVersionId: null,
      })
      .where(eq(stop.id, stopId))

    return { success: true }
  })
}

/**
 * Discard stop asset draft
 */
export async function discardStopAssetVersionDraft(stopId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const stopData = await tx.query.stop.findFirst({
      where: eq(stop.id, stopId),
      columns: { draftAssetVersionId: true },
    })

    if (!stopData?.draftAssetVersionId) {
      return false
    }

    // Delete draft version (cascades to items)
    await tx.delete(stopAsset).where(eq(stopAsset.id, stopData.draftAssetVersionId))

    // Clear pointer
    await tx.update(stop).set({ draftAssetVersionId: null }).where(eq(stop.id, stopId))

    return true
  })
}

/**
 * Unpublish stop assets
 */
export async function unpublishStopAssetVersion(
  stopId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const stopData = await tx.query.stop.findFirst({
      where: eq(stop.id, stopId),
      columns: { currentAssetVersionId: true, draftAssetVersionId: true },
    })

    if (!stopData?.currentAssetVersionId) {
      return { success: false, error: 'No published assets to unpublish' }
    }

    // If no draft exists, create one from the published version's items
    if (!stopData.draftAssetVersionId) {
      const currentItems = await tx.query.stopAssetVersion.findMany({
        where: eq(stopAssetVersion.stopAssetId, stopData.currentAssetVersionId),
      })

      // Get next version number
      const maxVersionResult = await tx
        .select({ maxVer: max(stopAsset.version) })
        .from(stopAsset)
        .where(eq(stopAsset.stopId, stopId))

      const nextVersion = (maxVersionResult[0]?.maxVer ?? 0) + 1

      // Create new draft version with same items
      const [newDraft] = await tx
        .insert(stopAsset)
        .values({
          stopId,
          version: nextVersion,
          createdBy: userId,
        })
        .returning()

      if (newDraft && currentItems.length > 0) {
        await tx.insert(stopAssetVersion).values(
          currentItems.map((item) => ({
            stopAssetId: newDraft.id,
            assetId: item.assetId,
            order: item.order,
            role: item.role,
            locale: item.locale,
          })),
        )
      }

      // Update pointers
      await tx
        .update(stop)
        .set({
          currentAssetVersionId: null,
          draftAssetVersionId: newDraft?.id ?? null,
        })
        .where(eq(stop.id, stopId))
    } else {
      // Draft exists, just clear current pointer
      await tx.update(stop).set({ currentAssetVersionId: null }).where(eq(stop.id, stopId))
    }

    return { success: true }
  })
}
