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

type VideoThumbnailOptions = {
  width?: number
  height?: number
  timeSeconds?: number
  format?: 'jpg' | 'png'
}

/**
 * Get a guarded Cloudflare video-frame thumbnail URL.
 * This uses the custom /v/ worker route, similar to image /i/ guarding.
 */
export function getAssetVideoThumbnailUrl(storagePath: string, options: VideoThumbnailOptions = {}): string {
  const baseUrl = clientEnv.VITE_R2_PUBLIC_URL
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath

  const width = options.width ?? 640
  const timeSeconds = options.timeSeconds ?? 2
  const format = options.format ?? 'jpg'

  const transforms = [`w-${width}`, `t-${timeSeconds}`, `f-${format}`]
  if (options.height) {
    transforms.push(`h-${options.height}`)
  }

  return `${baseUrl}/v/${transforms.join(',')}/${cleanPath}`
}
