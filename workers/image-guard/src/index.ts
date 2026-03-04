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
 *   w-{width}    → width (snapped to nearest ALLOWED_WIDTH)
 *   h-{height}   → height (optional, passed through)
 *   q-{quality}  → quality (optional, clamped to MAX_QUALITY)
 *
 * Fallback behavior (no 400s for transform issues):
 *   - Invalid/missing width   → defaults to largest width (1920)
 *   - Width not in whitelist  → snapped to nearest allowed width
 *   - Unknown transform keys  → silently ignored
 *   - Invalid values (NaN/≤0) → param ignored (width falls back to 1920)
 *   - Missing storage path    → 404 (genuinely broken URL)
 *
 * Always enforced:
 *   format       → auto (WebP/AVIF based on Accept header)
 *   fit          → cover (fill the area, crop if needed)
 */

const ALLOWED_WIDTHS: readonly number[] = [320, 640, 960, 1280, 1920]
const DEFAULT_WIDTH = 1920
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
      return new Response('Not Found', { status: 404 })
    }

    const transformSegment = withoutPrefix.slice(0, firstSlash)
    const storagePath = withoutPrefix.slice(firstSlash + 1)

    if (!storagePath || storagePath === '') {
      return new Response('Not Found', { status: 404 })
    }

    const params = parseTransforms(transformSegment)

    const width = snapToNearest(params.width || DEFAULT_WIDTH)
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
}

function parseTransforms(segment: string): ParsedTransforms {
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
      // Unknown keys: silently ignored
    }
  }

  return { width, height, quality }
}

function snapToNearest(requested: number): number {
  let closest = ALLOWED_WIDTHS[0]
  let minDiff = Math.abs(requested - closest)

  for (const w of ALLOWED_WIDTHS) {
    const diff = Math.abs(requested - w)
    if (diff < minDiff) {
      closest = w
      minDiff = diff
    }
  }

  return closest
}
