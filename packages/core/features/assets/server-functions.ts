import { createServerFn } from '@tanstack/react-start'
import { requireAssetAccess, requireOrgMember } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { serverEnv } from '../../env/server'
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
  .handler(
    handleError(async (): Promise<UploadCredentials> => {
      const supabase = await createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session')
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
    }),
  )

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
  organizationId: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

export const confirmAssetUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(confirmAssetUploadSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireOrgMember(data.organizationId, context.user.id)

      const supabase = await createClient()

      const {
        assetId,
        fileName,
        fileSize,
        mimeType,
        type,
        locale,
        storagePath,
        organizationId,
        width,
        height,
        duration,
      } = data

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
    }),
  )

// ============================================================================
// Delete Asset (POST)
// ============================================================================

const deleteAssetSchema = z.object({
  assetId: z.string(),
})

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetSchema)
  .handler(
    handleError(async ({ context, data }) => {
      await requireAssetAccess(data.assetId, context.user.id)

      const supabase = await createClient()

      const assetData = await db.query.asset.findFirst({
        where: eq(asset.id, data.assetId),
      })

      if (!assetData) throw new Error('Asset not found')

      const { error: storageError } = await supabase.storage.from('assets').remove([assetData.storagePath])

      if (storageError) throw storageError

      await db.delete(asset).where(eq(asset.id, data.assetId))

      return { success: true }
    }),
  )

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
  .handler(
    handleError(async ({ context, data }): Promise<AssetUsageDetails> => {
      await requireAssetAccess(data.assetId, context.user.id)

      const usage = await db.query.asset.findFirst({
        where: eq(asset.id, data.assetId),
        with: {
          guideAssets: {
            with: {
              guide: {
                columns: { id: true, nanoId: true },
                with: {
                  translations: {
                    with: {
                      currentVersion: {
                        columns: { title: true },
                      },
                    },
                  },
                },
              },
            },
          },
          stopAssets: {
            with: {
              stop: {
                columns: { id: true, nanoId: true },
                with: {
                  translations: {
                    with: {
                      currentVersion: {
                        columns: { title: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      return {
        guides:
          usage?.guideAssets.map((ga) => ({
            id: ga.guide.id,
            nanoId: ga.guide.nanoId,
            name: ga.guide.translations[0]?.currentVersion?.title ?? 'Untitled',
            role: ga.role,
            locale: ga.locale,
          })) ?? [],
        stops:
          usage?.stopAssets.map((sa) => ({
            id: sa.stop.id,
            nanoId: sa.stop.nanoId,
            name: sa.stop.translations[0]?.currentVersion?.title ?? 'Untitled',
            role: sa.role,
            locale: sa.locale,
          })) ?? [],
      }
    }),
  )
