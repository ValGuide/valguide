/**
 * ValGuide Image Guard Worker
 *
 * Uses Cloudflare's transform-at-edge approach:
 * - Images via Workers `cf.image` options.
 * - Video thumbnails via `/cdn-cgi/media/...` frame extraction.
 *
 * Guarded URL formats:
 * - Images: /i/{transforms}/{storagePath}
 * - Video thumbs: /v/{transforms}/{storagePath}
 */

const ALLOWED_WIDTHS: readonly number[] = [320, 640, 960, 1280, 1920]
const DEFAULT_WIDTH = 1920
const DEFAULT_QUALITY = 75
const MAX_QUALITY = 85

const DEFAULT_VIDEO_THUMB_WIDTH = 640
const DEFAULT_VIDEO_THUMB_TIME_SECONDS = 2
const MAX_VIDEO_THUMB_TIME_SECONDS = 600

type GuardMode = 'image' | 'video'

interface ParsedGuardPath {
  mode: GuardMode
  transformSegment: string
  storagePath: string
}

interface ParsedImageTransforms {
  width: number
  height?: number
  quality?: number
}

interface ParsedVideoTransforms {
  width: number
  height?: number
  timeSeconds?: number
  format: 'jpg' | 'png'
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (!path.startsWith('/i/') && !path.startsWith('/v/')) {
      return new Response('Not Found', { status: 404 })
    }

    // Prevent infinite loops for image transforms.
    if (/image-resizing/.test(request.headers.get('via') ?? '')) {
      return fetch(request)
    }

    const parsedPath = parseGuardPath(path)
    if (!parsedPath) {
      return new Response('Not Found', { status: 404 })
    }

    if (parsedPath.mode === 'image') {
      return handleImageRequest(parsedPath, request, url)
    }

    return handleVideoThumbnailRequest(parsedPath, url)
  },
} satisfies ExportedHandler

async function handleImageRequest(parsedPath: ParsedGuardPath, request: Request, url: URL): Promise<Response> {
  const params = parseImageTransforms(parsedPath.transformSegment)
  const width = snapToNearest(params.width || DEFAULT_WIDTH)
  const quality = Math.min(params.quality ?? DEFAULT_QUALITY, MAX_QUALITY)

  // Negotiate image format from Accept header.
  const accept = request.headers.get('accept') ?? ''
  let format: string = 'jpeg'
  if (/image\/avif/.test(accept)) {
    format = 'avif'
  } else if (/image\/webp/.test(accept)) {
    format = 'webp'
  }

  const originUrl = new URL(`/${parsedPath.storagePath}`, url.origin)

  const imageOptions: Record<string, unknown> = {
    width,
    quality,
    format,
    fit: 'cover',
  }
  if (params.height) {
    imageOptions.height = params.height
  }

  const response = await fetch(originUrl.toString(), {
    cf: { image: imageOptions },
  })

  if (!response.ok && !response.redirected) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }

  return withImmutableCache(response)
}

async function handleVideoThumbnailRequest(parsedPath: ParsedGuardPath, url: URL): Promise<Response> {
  const params = parseVideoTransforms(parsedPath.transformSegment)
  const width = snapToNearest(params.width || DEFAULT_VIDEO_THUMB_WIDTH)
  const timeSeconds = clamp(params.timeSeconds ?? DEFAULT_VIDEO_THUMB_TIME_SECONDS, 0, MAX_VIDEO_THUMB_TIME_SECONDS)

  const mediaOptions: string[] = [
    'mode=frame',
    `width=${width}`,
    `time=${timeSeconds}s`,
    `format=${params.format}`,
    'fit=contain',
  ]
  if (params.height) {
    mediaOptions.push(`height=${params.height}`)
  }

  const sourcePath = toEncodedPath(parsedPath.storagePath)
  const mediaUrl = `${url.origin}/cdn-cgi/media/${mediaOptions.join(',')}/${sourcePath}`

  const response = await fetch(mediaUrl, {
    headers: {
      Accept: 'image/avif,image/webp,image/jpeg,image/png,image/*,*/*',
    },
  })

  if (!response.ok && !response.redirected) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }

  return withImmutableCache(response)
}

function withImmutableCache(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function parseGuardPath(pathname: string): ParsedGuardPath | null {
  const mode: GuardMode | null = pathname.startsWith('/i/') ? 'image' : pathname.startsWith('/v/') ? 'video' : null
  if (!mode) {
    return null
  }

  const withoutPrefix = pathname.slice(3)
  const firstSlash = withoutPrefix.indexOf('/')
  if (firstSlash === -1) {
    return null
  }

  const transformSegment = withoutPrefix.slice(0, firstSlash)
  const storagePath = withoutPrefix.slice(firstSlash + 1)

  if (!storagePath || storagePath === '') {
    return null
  }

  return {
    mode,
    transformSegment,
    storagePath,
  }
}

function parseImageTransforms(segment: string): ParsedImageTransforms {
  const parts = segment.split(',')
  let width = 0
  let height: number | undefined
  let quality: number | undefined

  for (const part of parts) {
    const [key, rawValue] = part.split('-', 2)
    if (!key || !rawValue) continue

    const value = Number.parseInt(rawValue, 10)
    if (Number.isNaN(value) || value <= 0) continue

    switch (key) {
      case 'w':
        width = value
        break
      case 'h':
        height = value
        break
      case 'q':
        quality = value
        break
      // Unknown keys: silently ignored.
    }
  }

  return { width, height, quality }
}

function parseVideoTransforms(segment: string): ParsedVideoTransforms {
  const parts = segment.split(',')
  let width = 0
  let height: number | undefined
  let timeSeconds: number | undefined
  let format: 'jpg' | 'png' = 'jpg'

  for (const part of parts) {
    const [key, rawValue] = part.split('-', 2)
    if (!key || !rawValue) continue

    if (key === 'f') {
      if (rawValue === 'jpg' || rawValue === 'png') {
        format = rawValue
      }
      continue
    }

    if (key === 't') {
      const value = Number.parseFloat(rawValue)
      if (Number.isFinite(value) && value >= 0) {
        timeSeconds = value
      }
      continue
    }

    const value = Number.parseInt(rawValue, 10)
    if (Number.isNaN(value) || value <= 0) continue

    switch (key) {
      case 'w':
        width = value
        break
      case 'h':
        height = value
        break
      // Unknown keys: silently ignored.
    }
  }

  return { width, height, timeSeconds, format }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function snapToNearest(requested: number): number {
  let closest = ALLOWED_WIDTHS[0]
  let minDiff = Math.abs(requested - closest)

  for (const width of ALLOWED_WIDTHS) {
    const diff = Math.abs(requested - width)
    if (diff < minDiff) {
      closest = width
      minDiff = diff
    }
  }

  return closest
}

function toEncodedPath(storagePath: string): string {
  return storagePath
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}
