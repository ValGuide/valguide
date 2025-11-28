import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, type SupportedLocale, supportedLocales } from './i18n.config'

export const hasPathnameLocale = (req: NextRequest) => {
  // Check if there is any supported locale in the pathname
  const locale = getLocaleFromPathname(req.nextUrl.pathname)
  return isSupportedLocale(locale)
}

export const isSupportedLocale = (locale: string | undefined): locale is SupportedLocale =>
  supportedLocales.includes(locale as SupportedLocale)

const getAcceptLanguageLocale = (requestHeaders: Headers) => {
  const languages = new Negotiator({
    headers: {
      'accept-language': requestHeaders.get('accept-language') || undefined,
    },
  }).languages()
  try {
    return match(languages, supportedLocales, defaultLocale)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    // Invalid language
  }

  return undefined
}

export const getLocaleFromPathname = (pathname: string) => pathname.split('/')[1]

export const setLocaleCookie = (res: NextResponse, locale: string) => {
  res.cookies.set(COOKIE_LOCALE_NAME, locale, {
    sameSite: 'lax',
    maxAge: 31536000, // 1 year
  })
}

export const COOKIE_LOCALE_NAME = 'next-locale'

export const resolveLocale = (req: NextRequest): string => {
  const pathname = req.nextUrl.pathname

  // Prio 1: Use route prefix
  if (pathname) {
    const pathLocale = getLocaleFromPathname(pathname)
    if (isSupportedLocale(pathLocale)) {
      return pathLocale
    }
  }

  // Prio 2: Use existing cookie
  if (req.cookies.has(COOKIE_LOCALE_NAME)) {
    const value = req.cookies.get(COOKIE_LOCALE_NAME)?.value
    if (isSupportedLocale(value)) {
      return value
    }
  }

  // Prio 3: Use the `accept-language` header
  const locale = getAcceptLanguageLocale(req.headers)
  if (locale) {
    return locale
  }

  // Prio 4: Use default locale
  return defaultLocale
}
