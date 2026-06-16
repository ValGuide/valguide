import {
  canGenerateAssetVideoThumbnail,
  getDirectAssetUrl,
  getImageDeliveryProvider,
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
 * Get the optimized image URL for an asset.
 */
export function getAssetImageUrl(asset: { storagePath: string }): string {
  return getImageDeliveryProvider().getImageUrl(asset.storagePath)
}

/**
 * Get a provider-managed video-frame thumbnail URL when supported.
 * Returns null for providers that do not support server-side video thumbnails.
 */
export function getAssetVideoThumbnailUrl(storagePath: string, options: VideoThumbnailOptions = {}): string | null {
  return getImageDeliveryProvider().getVideoThumbnailUrl(storagePath, options)
}
