import type { NextMiddleware, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createLogger } from '@valguide/logger'

import { hasPathnameLocale, resolveLocale, setLocaleCookie } from '@/i18n/resolve-locale'
import { isInternalRoute, isLoginRoute, isProtectedRoute, routes, unlocalizedPathname } from '@/routes/routes'

const log = createLogger('middleware')

const authEnabled = false // Disabled authentication to make all routes public

const redirectLocalizedIfRequired = (req: NextRequest, locale: string) => {
  if (!hasPathnameLocale(req)) {
    const localizedPath = `/${locale}${req.nextUrl.pathname}`.replace(/\/$/, '')
    const localizedRoute = `${localizedPath}${req.nextUrl.search}`
    const url = new URL(localizedRoute, req.url)
    log.info(`Redirecting to '${url.toString()}'`)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// TODO: add auth and tests for it
export const middleware: NextMiddleware = async (req) => {
  const { pathname } = req.nextUrl
  const locale = resolveLocale(req)

  if (authEnabled) {
    const isProtected = isProtectedRoute(pathname)
    const isInternal = isInternalRoute(pathname)
    const isLogin = isLoginRoute(pathname)

    if (isProtected || isInternal || isLogin) {
      const session = null // TODO get session

      // we are already logged in and tried to open a login URL
      if (session && isLogin) {
        const defaultRedirect = new URL(`/${locale}${routes.console}`, req.url)
        return NextResponse.redirect(defaultRedirect)
      }

      // we are trying to access an internal route without being an internal user
      if (
        session &&
        isInternal

        // TODO: protecte by specific emaila addresses
        // (!session.user?.email || ['console@valguide.com', 'valerius@valguide.com'].includes(session.user.email))
      ) {
        const notFound = new URL(`/${locale}/404`, req.url)
        return NextResponse.rewrite(notFound)
      }

      // we are trying to access a protected route without being logged in
      if (!session && !isLogin) {
        const next = `${unlocalizedPathname(pathname)}${req.nextUrl.search}`
        const redirectUrl = new URL(`/${locale}${routes.login}`, req.url)
        redirectUrl.searchParams.set('next', next)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  const res = redirectLocalizedIfRequired(req, locale)
  setLocaleCookie(res, locale)
  return res
}

export const config = {
  // match anything that doesn't have a file extension
  // e.g. not *.js, *.json, *.png etc.
  // this basically matches all ours paths and ignores all _next resources
  matcher: ['/((?!api|monitoring|.*\\.[^/]+$).+)', '/'],
}
