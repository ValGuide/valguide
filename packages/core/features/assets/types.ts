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
