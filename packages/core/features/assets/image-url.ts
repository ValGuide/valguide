import { clientEnv } from '../../env/client'

/**
 * Generates an ImageKit URL from a storage path.
 * Falls back to Supabase public URL if ImageKit is not configured.
 */
export function getImageKitUrl(storagePath: string): string {
  const baseUrl = clientEnv.VITE_IMAGEKIT_URL
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath
  return `${baseUrl}/${cleanPath}`
}

/**
 * Get optimized image URL from an asset object.
 * Prefers storagePath + ImageKit for production assets.
 * Falls back to publicUrl when storagePath is not provided (e.g., Storybook mocks).
 */
export function getAssetImageUrl(asset: { storagePath?: string | null; publicUrl?: string | null }): string {
  if (asset.storagePath) {
    return getImageKitUrl(asset.storagePath)
  }
  if (asset.publicUrl) {
    return asset.publicUrl
  }
  return ''
}
