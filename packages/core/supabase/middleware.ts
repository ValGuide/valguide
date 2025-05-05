import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { unlocalizedPathname } from '@valguide/i18n/route.utils'
import { hasPathnameLocale, resolveLocale, setLocaleCookie } from '@valguide/i18n/resolve-locale'
import { createLogger } from '@valguide/logger'

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

export const supabaseMiddlewareFn = (
  options: {
    routes: RouteConfig[]
  } = { routes: [] },
) => {
  const { routes } = options
  const getConfig = (pathname: string): RouteConfig | undefined => routes.find((config) => config.route == pathname)

  return withLocale(async (req, locale) => {
    const pathname = unlocalizedPathname(req.nextUrl.pathname)
    const config = getConfig(pathname)

    // early redirect to correct locale
    if (config?.localized !== false && !hasPathnameLocale(req)) {
      const localizedPath = `/${locale}${req.nextUrl.pathname}`.replace(/\/$/, '')
      const localizedRoute = `${localizedPath}${req.nextUrl.search}`
      const url = new URL(localizedRoute, req.url)
      log.info(`Redirecting to '${url.toString()}'`)
      return NextResponse.redirect(url)
    }

    // supabase auth redirects
    let supabaseResponse = NextResponse.next({
      request: req,
    })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request: req,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    if (config?.type == 'protected' || config?.type == 'internal') {
      // Do not run code between createServerClient and
      // supabase.auth.getUser(). A simple mistake could make it very hard to debug
      // issues with users being randomly logged out.
      // IMPORTANT: DO NOT REMOVE auth.getUser()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (config?.type == 'internal' && (!user?.email || !internalUsers.includes(user.email))) {
        const notFound = new URL(`/${locale}/404`, req.url)
        return NextResponse.rewrite(notFound)
      }

      if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
        // no user, potentially respond by redirecting the user to the login page
        const url = req.nextUrl.clone()
        url.pathname = `/${locale}/login`
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
