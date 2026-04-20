import { transform as imagekitTransform } from 'unpic/providers/imagekit'
import { clientEnv } from '../../env/client'
import { getAssetBaseUrl } from './asset-base-url'

export type ImageDeliveryProviderId = 'cloudflare' | 'imagekit' | 'origin'

export type ImageTransformerOperations = {
  width?: number
  height?: number
}

export type ImageTransformer = (src: string | URL, operations?: ImageTransformerOperations) => string

export type VideoThumbnailOptions = {
  width?: number
  height?: number
  timeSeconds?: number
  format?: 'jpg' | 'png'
}

export type ImageDeliveryProvider = {
  id: ImageDeliveryProviderId
  getImageUrl(storagePath: string): string
  getVideoThumbnailUrl(storagePath: string, options?: VideoThumbnailOptions): string | null
  transformer?: ImageTransformer
  breakpoints?: number[]
  supportsVideoThumbnails: boolean
}

const CLOUDFLARE_BREAKPOINTS = [320, 640, 960, 1280, 1920]

function isAbsoluteUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

export function getDirectAssetUrl(storagePath: string): string {
  if (isAbsoluteUrl(storagePath)) {
    return storagePath
  }

  const baseUrl = getAssetBaseUrl()
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath

  return `${baseUrl}/${cleanPath}`
}

export function getImageKitAssetUrl(storagePath: string): string {
  if (isAbsoluteUrl(storagePath)) {
    return storagePath
  }

  const baseUrl = clientEnv.VITE_IMAGEKIT_URL
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath

  return `${baseUrl}/${cleanPath}`
}

function buildCloudflareVideoThumbnailUrl(storagePath: string, options: VideoThumbnailOptions = {}): string {
  const baseUrl = getAssetBaseUrl()
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

function cloudflareGuardTransform(src: string | URL, operations?: ImageTransformerOperations): string {
  const url = new URL(src)
  const assetBaseUrl = getAssetBaseUrl()
  const assetOrigin = new URL(assetBaseUrl)

  let storagePath = url.pathname
  if (url.origin === assetOrigin.origin) {
    storagePath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
  }

  const parts: string[] = []
  if (operations?.width) parts.push(`w-${operations.width}`)
  if (operations?.height) parts.push(`h-${operations.height}`)
  const transformSegment = parts.length > 0 ? parts.join(',') : 'w-1920'

  return `${assetBaseUrl}/i/${transformSegment}/${storagePath}`
}

function identityTransform(src: string | URL): string {
  return String(src)
}

function getCloudflareImageDeliveryProvider(): ImageDeliveryProvider {
  return {
    id: 'cloudflare',
    getImageUrl: getDirectAssetUrl,
    getVideoThumbnailUrl: buildCloudflareVideoThumbnailUrl,
    transformer: cloudflareGuardTransform,
    breakpoints: CLOUDFLARE_BREAKPOINTS,
    supportsVideoThumbnails: true,
  }
}

function getImageKitImageDeliveryProvider(): ImageDeliveryProvider {
  return {
    id: 'imagekit',
    getImageUrl: getImageKitAssetUrl,
    getVideoThumbnailUrl: () => null,
    transformer: (src, operations) => imagekitTransform(src, operations ?? {}),
    supportsVideoThumbnails: false,
  }
}

function getOriginImageDeliveryProvider(): ImageDeliveryProvider {
  return {
    id: 'origin',
    getImageUrl: getDirectAssetUrl,
    getVideoThumbnailUrl: () => null,
    transformer: identityTransform,
    supportsVideoThumbnails: false,
  }
}

export function getImageDeliveryProviderId(): ImageDeliveryProviderId {
  return clientEnv.VITE_IMAGE_DELIVERY_PROVIDER ?? clientEnv.VITE_IMAGE_PROVIDER
}

export function getImageDeliveryProvider(): ImageDeliveryProvider {
  switch (getImageDeliveryProviderId()) {
    case 'imagekit':
      return getImageKitImageDeliveryProvider()
    case 'origin':
      return getOriginImageDeliveryProvider()
    case 'cloudflare':
    default:
      return getCloudflareImageDeliveryProvider()
  }
}

export function canGenerateAssetVideoThumbnail(): boolean {
  return getImageDeliveryProvider().supportsVideoThumbnails
}

export function getImageComponentConfig(): {
  transformer?: ImageTransformer
  breakpoints?: number[]
} {
  const provider = getImageDeliveryProvider()

  return {
    transformer: provider.transformer,
    breakpoints: provider.breakpoints,
  }
}
