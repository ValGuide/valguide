import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { serverEnv } from '@valguide/core/env/server'
import { getShortLinkByCode } from '@valguide/core/features/links/get-short-link'
import { CACHE_TTL, getCache, getLinkCacheKey, setCache } from '@valguide/core/features/links/kv'
import { buildPathFromShortLink, isAbsoluteUrl } from '@valguide/core/features/links/paths'
import { z } from 'zod'

const resolveShortLinkFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data: { code } }): Promise<{ redirectUrl: string } | { error: string; status: number }> => {
    const appBaseUrl = serverEnv.APP_BASE_URL
    const cacheKey = getLinkCacheKey(code)

    let path = await getCache(cacheKey)

    if (!path) {
      const shortLink = await getShortLinkByCode(code)
      if (!shortLink) {
        return { error: 'Not found', status: 404 }
      }

      path = await buildPathFromShortLink(shortLink)
      if (!path) {
        return { error: 'Invalid link configuration', status: 500 }
      }

      await setCache(cacheKey, path, { ttl: CACHE_TTL })
    }

    const redirectUrl = isAbsoluteUrl(path) ? path : `${appBaseUrl}${path}`
    return { redirectUrl }
  })

export const Route = createFileRoute('/s/$code')({
  loader: async ({ params }) => {
    const result = await resolveShortLinkFn({ data: { code: params.code } })

    if ('error' in result) {
      throw new Error(result.error)
    }

    throw redirect({
      href: result.redirectUrl,
    })
  },
  component: () => null,
})
