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
import { guide, guideAsset, guideLocaleDraft, stop, stopAsset, stopLocaleDraft } from '../guides/schema'
import { asset } from './schema'

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

    const { assetId, fileName, fileSize, mimeType, type, storagePath, width, height, duration } = data

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
    channel: string
    locale: string | null
  }>
  stops: Array<{
    id: string
    nanoId: string
    name: string
    channel: string
    locale: string | null
  }>
}

export const getAssetUsageDetailsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetUsageDetailsSchema)
  .handler(async ({ context, data }): Promise<AssetUsageDetails> => {
    await requireAssetAccess(data.assetId, context.user.id)

    // Query guide usage from live asset assignments
    const guideUsage = await db
      .select({
        guideId: guide.id,
        guideNanoId: guide.nanoId,
        title: guideLocaleDraft.title,
        channel: guideAsset.channel,
        locale: guideAsset.locale,
      })
      .from(guideAsset)
      .innerJoin(guide, eq(guideAsset.guideId, guide.id))
      .leftJoin(guideLocaleDraft, eq(guideLocaleDraft.guideLocaleId, guide.id))
      .where(eq(guideAsset.assetId, data.assetId))

    // Query stop usage from live asset assignments
    const stopUsage = await db
      .select({
        stopId: stop.id,
        stopNanoId: stop.nanoId,
        title: stopLocaleDraft.title,
        channel: stopAsset.channel,
        locale: stopAsset.locale,
      })
      .from(stopAsset)
      .innerJoin(stop, eq(stopAsset.stopId, stop.id))
      .leftJoin(stopLocaleDraft, eq(stopLocaleDraft.stopLocaleId, stop.id))
      .where(eq(stopAsset.assetId, data.assetId))

    // Deduplicate by guide/stop id (multiple locales may exist)
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
        channel: g.channel,
        locale: g.locale,
      })),
      stops: Array.from(uniqueStops.values()).map((s) => ({
        id: s.stopId,
        nanoId: s.stopNanoId,
        name: s.title ?? 'Untitled',
        channel: s.channel,
        locale: s.locale,
      })),
    }
  })
