import { createServerFn } from '@tanstack/react-start'
import {
  NotFoundError,
  requireAssetAccess,
  requireOrgMember,
  UnauthenticatedError,
} from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { serverEnv } from '../../env/server'
import {
  guide,
  guideTranslation,
  guideTranslationVersion,
  stop,
  stopTranslation,
  stopTranslationVersion,
} from '../guides/schema'
import { asset, guideAsset, guideAssetVersion, stopAsset, stopAssetVersion } from './schema'

export type AssetType = 'image' | 'audio' | 'video'

export type UploadCredentials = {
  accessToken: string
  projectId: string
}

// ============================================================================
// Upload Credentials (GET)
// ============================================================================

export const getUploadCredentialsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async (): Promise<UploadCredentials> => {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new UnauthenticatedError()
    }

    const supabaseUrl = serverEnv.SUPABASE_URL
    const projectId = new URL(supabaseUrl).hostname.split('.')[0]

    if (!projectId) {
      throw new Error('Could not extract project ID from Supabase URL')
    }

    return {
      accessToken: session.access_token,
      projectId,
    }
  })

// ============================================================================
// Confirm Asset Upload (POST)
// ============================================================================

const confirmAssetUploadSchema = z.object({
  assetId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.enum(['image', 'audio', 'video']),
  locale: z.string().optional(),
  storagePath: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

export const confirmAssetUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(confirmAssetUploadSchema)
  .handler(async ({ context, data }) => {
    const organizationId = context.activeOrgId!
    await requireOrgMember(organizationId, context.user.id)

    const supabase = await createClient()

    const { assetId, fileName, fileSize, mimeType, type, locale, storagePath, width, height, duration } = data

    const {
      data: { publicUrl },
    } = supabase.storage.from('assets').getPublicUrl(storagePath)

    const [newAsset] = await db
      .insert(asset)
      .values({
        nanoId: assetId,
        fileName,
        fileSize,
        mimeType,
        type,
        storagePath,
        publicUrl,
        locale: locale ?? null,
        organizationId,
        uploadedBy: context.user.id,
        width: width ?? null,
        height: height ?? null,
        duration: duration ?? null,
      })
      .returning()

    return newAsset
  })

// ============================================================================
// Delete Asset (POST)
// ============================================================================

const deleteAssetSchema = z.object({
  assetId: z.string(),
})

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetSchema)
  .handler(async ({ context, data }) => {
    await requireAssetAccess(data.assetId, context.user.id)

    const supabase = await createClient()

    const assetData = await db.query.asset.findFirst({
      where: eq(asset.id, data.assetId),
    })

    if (!assetData) throw new NotFoundError('Asset')

    const { error: storageError } = await supabase.storage.from('assets').remove([assetData.storagePath])

    if (storageError) throw storageError

    await db.delete(asset).where(eq(asset.id, data.assetId))

    return { success: true }
  })

// ============================================================================
// Get Asset Usage Details (GET)
// ============================================================================

const getAssetUsageDetailsSchema = z.object({
  assetId: z.string(),
})

export type AssetUsageDetails = {
  guides: Array<{
    id: string
    nanoId: string
    name: string
    role: string
    locale: string | null
  }>
  stops: Array<{
    id: string
    nanoId: string
    name: string
    role: string
    locale: string | null
  }>
}

export const getAssetUsageDetailsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetUsageDetailsSchema)
  .handler(async ({ context, data }): Promise<AssetUsageDetails> => {
    await requireAssetAccess(data.assetId, context.user.id)

    // Query guide usage from versioned tables
    const guideUsage = await db
      .select({
        guideId: guide.id,
        guideNanoId: guide.nanoId,
        title: guideTranslationVersion.title,
        role: guideAssetVersion.role,
        locale: guideAssetVersion.locale,
      })
      .from(guideAssetVersion)
      .innerJoin(guideAsset, eq(guideAssetVersion.guideAssetId, guideAsset.id))
      .innerJoin(guide, eq(guideAsset.guideId, guide.id))
      .leftJoin(guideTranslation, eq(guideTranslation.guideId, guide.id))
      .leftJoin(guideTranslationVersion, eq(guideTranslation.currentVersionId, guideTranslationVersion.id))
      .where(eq(guideAssetVersion.assetId, data.assetId))

    // Query stop usage from versioned tables
    const stopUsage = await db
      .select({
        stopId: stop.id,
        stopNanoId: stop.nanoId,
        title: stopTranslationVersion.title,
        role: stopAssetVersion.role,
        locale: stopAssetVersion.locale,
      })
      .from(stopAssetVersion)
      .innerJoin(stopAsset, eq(stopAssetVersion.stopAssetId, stopAsset.id))
      .innerJoin(stop, eq(stopAsset.stopId, stop.id))
      .leftJoin(stopTranslation, eq(stopTranslation.stopId, stop.id))
      .leftJoin(stopTranslationVersion, eq(stopTranslation.currentVersionId, stopTranslationVersion.id))
      .where(eq(stopAssetVersion.assetId, data.assetId))

    // Deduplicate by guide/stop id (multiple translations may exist)
    const uniqueGuides = new Map<string, (typeof guideUsage)[0]>()
    for (const g of guideUsage) {
      if (!uniqueGuides.has(g.guideId)) {
        uniqueGuides.set(g.guideId, g)
      }
    }

    const uniqueStops = new Map<string, (typeof stopUsage)[0]>()
    for (const s of stopUsage) {
      if (!uniqueStops.has(s.stopId)) {
        uniqueStops.set(s.stopId, s)
      }
    }

    return {
      guides: Array.from(uniqueGuides.values()).map((g) => ({
        id: g.guideId,
        nanoId: g.guideNanoId,
        name: g.title ?? 'Untitled',
        role: g.role,
        locale: g.locale,
      })),
      stops: Array.from(uniqueStops.values()).map((s) => ({
        id: s.stopId,
        nanoId: s.stopNanoId,
        name: s.title ?? 'Untitled',
        role: s.role,
        locale: s.locale,
      })),
    }
  })
