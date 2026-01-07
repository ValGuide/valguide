import { createServerClient } from '@supabase/ssr'
import { hasPathnameLocale, resolveLocale, setLocaleCookie } from '@valguide/i18n/resolve-locale'
import { unlocalizedPathname } from '@valguide/i18n/route.utils'
import { createLogger } from '@valguide/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { serverEnv } from '../env/server'
import { cookieOptions } from './cookies'

const internalUsers = ['valerius@valguide.com']

export type RouteType = 'internal' | 'protected' | 'public'

export type RouteConfig = { route: string; localized?: boolean; type?: RouteType }

const log = createLogger('middlware')

const withLocale = (fn: (req: NextRequest, locale: string) => Promise<NextResponse>) => async (req: NextRequest) => {
  const locale = resolveLocale(req)
  const res = await fn(req, locale)
  setLocaleCookie(res, locale)
  return res
}

export const supbaseProxyFn = (options?: {
  routes?: RouteConfig[]
  defaultNextUrl?: string
  defaultConfig?: Omit<RouteConfig, 'route'>
}) => {
  const { routes = [], defaultNextUrl = '' } = options ?? {}
  const getConfig = (pathname: string): RouteConfig | Omit<RouteConfig, 'route'> | undefined =>
    routes.find((config) => config.route === pathname) ?? options?.defaultConfig

  const localizedResponse = (
    req: NextRequest,
    config: RouteConfig | Omit<RouteConfig, 'route'> | undefined,
    locale: string,
  ) => {
    if (config?.localized !== false && !hasPathnameLocale(req)) {
      const localizedPath = `/${locale}${req.nextUrl.pathname}`.replace(/\/$/, '')
      const localizedRoute = `${localizedPath}${req.nextUrl.search}`
      const url = new URL(localizedRoute, req.url)
      log.info(`Redirecting to '${url.toString()}'`)
      return NextResponse.redirect(url)
    }
    return NextResponse.next({
      request: req,
    })
  }

  return withLocale(async (req, locale) => {
    const pathname = unlocalizedPathname(req.nextUrl.pathname)
    const config = getConfig(pathname)

    let supabaseResponse = localizedResponse(req, config, locale)

    const supabase = createServerClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            req.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({
            request: req,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
      cookieOptions: cookieOptions(),
    })

    if (
      config?.type === 'protected' ||
      config?.type === 'internal' ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/login')
    ) {
      // Do not run code between createServerClient and
      // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
      // issues with users being randomly logged out.
      // IMPORTANT: DO NOT REMOVE auth.getClaims()
      const startTime = Date.now()
      const { data } = await supabase.auth.getClaims()
      const user = data?.claims

      console.info(`Finished JWT verification in ${Date.now() - startTime}ms`, data?.header)

      if (config?.type === 'internal' && (!user?.email || !internalUsers.includes(user.email))) {
        const notFound = new URL(`/${locale}/404`, req.url)
        return NextResponse.rewrite(notFound)
      }

      if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
        const url = req.nextUrl.clone()
        url.pathname = `/${locale}/login`
        return NextResponse.redirect(url)
      }

      if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
        const next = `/${locale}/${unlocalizedPathname(req.nextUrl.searchParams.get('next') ?? defaultNextUrl)}`
        req.nextUrl.searchParams.delete('next')
        const url = req.nextUrl.clone()
        url.pathname = next
        return NextResponse.redirect(url)
      }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!
    return supabaseResponse
  })
}
