import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextURL } from 'next/dist/server/web/next-url'
import type { NextRequest } from 'next/dist/server/web/spec-extension/request'
import type { NextFetchEvent } from 'next/server'

export type MockRequestParams = {
  url: string | URL
  base: string
  cookies?: Record<string, string>
  headers?: Record<string, string>
}

export const mockRequest = ({ url, cookies, headers, base }: MockRequestParams): NextRequest => {
  return {
    cookies: new RequestCookies(
      new Headers({
        cookie: Object.entries(cookies ?? {})
          .reduce<string[]>((acc, [key, value]) => {
            return [...acc, `${key}=${value}`]
          }, [])
          .join(';'),
      }),
    ),
    nextUrl: new NextURL(url, base),
    headers: new Headers(headers),
  } as NextRequest
}

export const mockFetchEvent = () => ({}) as NextFetchEvent
