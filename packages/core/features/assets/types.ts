/**
 * Pure TypeScript type definitions for assets feature.
 * These mirror the Drizzle-inferred types but don't import from schema.ts,
 * making them safe to import in browser/Storybook environments.
 */

export type AssetType = 'image' | 'audio' | 'video'

export interface Asset {
  id: string
  nanoId: string
  fileName: string
  fileSize: number
  mimeType: string
  type: AssetType
  storagePath: string
  publicUrl: string | null
  width: number | null
  height: number | null
  duration: number | null
  organizationId: string
  uploadedBy: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Asset with usage counts (mirrors type in get-assets.server.ts)
 */
export interface AssetWithUsage extends Asset {
  tourCount: number
  stopCount: number
}
