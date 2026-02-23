import { clientEnv } from '../../env/client'

/**
 * Get the public URL for any asset from its storage path.
 * This is the ONLY function that builds asset URLs.
 *
 * For images: downstream can pass this to ImageKit for transforms.
 * For audio/video: this URL is used directly (served via CF CDN, $0 egress).
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
 * Get the best URL for an asset based on type.
 * Images → ImageKit (transforms + CDN)
 * Audio/Video → R2 direct (CF CDN, no transforms needed)
 */
export function getAssetDisplayUrl(asset: { storagePath: string; type: 'image' | 'audio' | 'video' }): string {
  if (asset.type === 'image') {
    return getImageKitUrl(asset.storagePath)
  }
  return getAssetUrl(asset.storagePath)
}

/**
 * Get optimized image URL from an asset object via ImageKit.
 */
export function getAssetImageUrl(asset: { storagePath: string }): string {
  return getImageKitUrl(asset.storagePath)
}
