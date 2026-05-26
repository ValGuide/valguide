import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { serverEnv } from '@valguide/core/env/server'
import { getShortLinkByCode } from '@valguide/core/features/links/get-short-link'
import { getCache, getLinkCacheKey, setCache } from '@valguide/core/features/links/kv'
import { buildPathFromShortLink, isAbsoluteUrl } from '@valguide/core/features/links/paths'
import { isShortLinkRedirectable } from '@valguide/core/features/links/redirectability'
import { trackShortLinkOpen } from '@valguide/core/features/links/track-short-link-open.server'
import { z } from 'zod'

const resolveShortLinkFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data: { code } }): Promise<{ redirectUrl: string } | { error: string; status: number }> => {
    const appBaseUrl = serverEnv.APP_BASE_URL
    const cacheKey = getLinkCacheKey(code)
    const shortLink = await getShortLinkByCode(code)

    if (!shortLink) {
      return { error: 'Not found', status: 404 }
    }

    if (!isShortLinkRedirectable(shortLink)) {
      return { error: 'Link is not active', status: 410 }
    }

    let path = await getCache(cacheKey)

    if (!path) {
      path = await buildPathFromShortLink(shortLink)
      if (!path) {
        return { error: 'Invalid link configuration', status: 500 }
      }

      await setCache(cacheKey, path)
    }

    try {
      await trackShortLinkOpen(shortLink.id)
    } catch (error) {
      console.error('[links] failed to track short link open', { code, error })
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
