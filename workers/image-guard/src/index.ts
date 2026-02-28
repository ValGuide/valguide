/**
 * ValGuide Image Guard Worker
 *
 * Uses Cloudflare's "Transform via Workers" approach:
 * https://developers.cloudflare.com/images/transform-images/transform-via-workers/
 *
 * Sits at /i/{transforms}/{storagePath} and fetches the original
 * image from the R2 origin with cf.image options for edge transformation.
 *
 * URL format:
 *   /i/w-{width}/{storagePath}
 *   /i/w-{width},q-{quality}/{storagePath}
 *   /i/w-{width},h-{height}/{storagePath}
 *
 * Allowed transforms:
 *   w-{width}    → width (must be in ALLOWED_WIDTHS)
 *   h-{height}   → height (optional, passed through)
 *   q-{quality}  → quality (optional, clamped to MAX_QUALITY)
 *
 * Always enforced:
 *   format       → auto (WebP/AVIF based on Accept header)
 *   fit          → cover (fill the area, crop if needed)
 */

const ALLOWED_WIDTHS = new Set([320, 640, 960, 1280, 1920])
const DEFAULT_QUALITY = 75
const MAX_QUALITY = 85

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (!path.startsWith('/i/')) {
      return new Response('Not Found', { status: 404 })
    }

    // Prevent infinite loops: if this request is already from image-resizing, pass through
    if (/image-resizing/.test(request.headers.get('via') ?? '')) {
      return fetch(request)
    }

    // Parse: /i/{transforms}/{storagePath...}
    const withoutPrefix = path.slice(3) // Remove "/i/"
    const firstSlash = withoutPrefix.indexOf('/')
    if (firstSlash === -1) {
      return errorResponse(400, 'Missing storage path')
    }

    const transformSegment = withoutPrefix.slice(0, firstSlash)
    const storagePath = withoutPrefix.slice(firstSlash + 1)

    if (!storagePath || storagePath === '') {
      return errorResponse(400, 'Missing storage path')
    }

    const params = parseTransforms(transformSegment)
    if (params.error) {
      console.log(
        `Image guard rejected: ${params.error} | path=${path} | ip=${request.headers.get('cf-connecting-ip')}`,
      )
      return errorResponse(400, params.error)
    }

    if (!ALLOWED_WIDTHS.has(params.width)) {
      console.log(
        `Image guard rejected: invalid width ${params.width} | path=${path} | ip=${request.headers.get('cf-connecting-ip')}`,
      )
      return errorResponse(400, `Invalid width: ${params.width}. Allowed: ${[...ALLOWED_WIDTHS].join(', ')}`)
    }

    const quality = Math.min(params.quality ?? DEFAULT_QUALITY, MAX_QUALITY)

    // Negotiate format from Accept header
    const accept = request.headers.get('accept') ?? ''
    let format: string = 'jpeg'
    if (/image\/avif/.test(accept)) {
      format = 'avif'
    } else if (/image\/webp/.test(accept)) {
      format = 'webp'
    }

    const originUrl = new URL(`/${storagePath}`, url.origin)

    const imageOptions: Record<string, unknown> = {
      width: params.width,
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

    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
} satisfies ExportedHandler

// ── Helpers ──────────────────────────────────────────────────

interface ParsedTransforms {
  width: number
  height?: number
  quality?: number
  error?: string
}

function parseTransforms(segment: string): ParsedTransforms {
  const parts = segment.split(',')
  let width = 0
  let height: number | undefined
  let quality: number | undefined

  for (const part of parts) {
    const [key, rawValue] = part.split('-', 2)
    if (!key || !rawValue) {
      return { width: 0, error: `Invalid transform: ${part}` }
    }

    const value = Number.parseInt(rawValue, 10)
    if (Number.isNaN(value) || value <= 0) {
      return { width: 0, error: `Invalid value for ${key}: ${rawValue}` }
    }

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
      default:
        return { width: 0, error: `Unknown transform: ${key}` }
    }
  }

  if (width === 0) {
    return { width: 0, error: 'Width (w) is required' }
  }

  return { width, height, quality }
}

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
