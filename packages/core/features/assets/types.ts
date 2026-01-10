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
  type: string
  storagePath: string
  publicUrl: string | null
  locale: string | null
  width: number | null
  height: number | null
  duration: number | null
  organizationId: string | null
  uploadedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface GuideAsset {
  id: string
  guideId: string
  assetId: string
  order: number
  role: string
  locale: string | null
  createdAt: Date
}

export interface StopAsset {
  id: string
  stopId: string
  assetId: string
  order: number
  role: string
  locale: string | null
  createdAt: Date
}

export type AssetWithRelations = Asset & {
  guideAssets: GuideAsset[]
  stopAssets: StopAsset[]
}
