import {
  canGenerateAssetVideoThumbnail,
  getDirectAssetUrl,
  getImageDeliveryProvider,
  getImageKitAssetUrl,
  type VideoThumbnailOptions,
} from '../../platform/images/image-delivery'

export { canGenerateAssetVideoThumbnail }

/**
 * Get the public URL for any asset from its storage path.
 * Used for all asset types (images, audio, video).
 */
export function getAssetUrl(storagePath: string): string {
  return getDirectAssetUrl(storagePath)
}

/**
 * Get an ImageKit-optimized URL for image assets.
 * Delegates to ImageKit when it is used as the image delivery provider.
 */
export function getImageKitUrl(storagePath: string): string {
  return getImageKitAssetUrl(storagePath)
}

/**
 * Get the optimized image URL for an asset.
 */
export function getAssetImageUrl(asset: { storagePath: string }): string {
  return getImageDeliveryProvider().getImageUrl(asset.storagePath)
}

/**
 * Get the best URL for an asset based on type.
 * Images are optimized by the active provider.
 * Audio/video/documents are served from the direct asset origin.
 */
export function getAssetDisplayUrl(asset: {
  storagePath: string
  type: 'image' | 'audio' | 'video' | 'document'
}): string {
  if (asset.type === 'image') {
    return getAssetImageUrl(asset)
  }
  return getAssetUrl(asset.storagePath)
}

/**
 * Get a provider-managed video-frame thumbnail URL when supported.
 * Returns null for providers that do not support server-side video thumbnails.
 */
export function getAssetVideoThumbnailUrl(storagePath: string, options: VideoThumbnailOptions = {}): string | null {
  return getImageDeliveryProvider().getVideoThumbnailUrl(storagePath, options)
}
