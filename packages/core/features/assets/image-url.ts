import { clientEnv } from '../../env/client'

/**
 * Get the public URL for any asset from its storage path.
 * Used for all asset types (images, audio, video).
 */
export function getAssetUrl(storagePath: string): string {
  const baseUrl = clientEnv.VITE_R2_PUBLIC_URL
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath
  return `${baseUrl}/${cleanPath}`
}

/**
 * Get an ImageKit-optimized URL for image assets.
 * Delegates to ImageKit which pulls from R2 as origin.
 */
export function getImageKitUrl(storagePath: string): string {
  const baseUrl = clientEnv.VITE_IMAGEKIT_URL
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath
  return `${baseUrl}/${cleanPath}`
}

/**
 * Get the optimized image URL for an asset.
 *
 * - cloudflare: Returns R2 public URL — the <Image> component's custom
 *   transformer rewrites this to /i/{transforms}/{path} at render time.
 * - imagekit: Returns ImageKit URL for transforms + CDN.
 */
export function getAssetImageUrl(asset: { storagePath: string }): string {
  if (clientEnv.VITE_IMAGE_PROVIDER === 'imagekit') {
    return getImageKitUrl(asset.storagePath)
  }
  return getAssetUrl(asset.storagePath)
}

/**
 * Get the best URL for an asset based on type.
 * Images are optimized by the active provider.
 * Audio/video are served directly from R2.
 */
export function getAssetDisplayUrl(asset: { storagePath: string; type: 'image' | 'audio' | 'video' }): string {
  if (asset.type === 'image') {
    return getAssetImageUrl(asset)
  }
  return getAssetUrl(asset.storagePath)
}
