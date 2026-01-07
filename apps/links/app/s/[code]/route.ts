import { serverEnv } from '@valguide/core/env/server'
import { buildPathFromShortLink, isAbsoluteUrl } from '@valguide/core/features/links/paths'
import { getShortLinkByCode } from '@valguide/core/features/links/queries'
import { CACHE_TTL, getCache, getLinkCacheKey, setCache } from '@valguide/core/features/links/redis'
import { type NextRequest, NextResponse } from 'next/server'

const APP_BASE_URL = serverEnv.APP_BASE_URL

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cacheKey = getLinkCacheKey(code)

  // 1. Try Redis cache (stores the computed path)
  let path = await getCache<string>(cacheKey)

  // 2. Fallback to DB
  if (!path) {
    const shortLink = await getShortLinkByCode(code)
    if (!shortLink) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Build path from metadata
    path = buildPathFromShortLink(shortLink)
    if (!path) {
      return NextResponse.json({ error: 'Invalid link configuration' }, { status: 500 })
    }

    // Cache for future requests
    await setCache(cacheKey, path, { ttl: CACHE_TTL })
  }

  // 3. Build redirect URL
  const redirectUrl = isAbsoluteUrl(path) ? path : `${APP_BASE_URL}${path}`

  return NextResponse.redirect(redirectUrl, 302)
}
