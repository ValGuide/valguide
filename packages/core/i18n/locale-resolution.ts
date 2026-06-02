import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { defaultLocale, type SupportedLocale, supportedLocales } from './i18n.config'

export const LOCALE_COOKIE_NAME = 'valguide-locale'
const LOCALE_QUERY_PARAM_NAME = 'hl'

export type LocaleSource = 'query-param' | 'cookie' | 'accept-language' | 'default'
export type ResolvedLocaleState = {
  locale: SupportedLocale
  hasLocaleCookie: boolean
  source: LocaleSource
}
type ResolveLocaleStateOptions = {
  headers?: Headers | null
  url?: string | URL | null
}

export const isSupportedLocale = (locale: string | undefined | null): locale is SupportedLocale =>
  supportedLocales.includes(locale as SupportedLocale)

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null
  }

  const entries = cookieHeader.split(';')
  for (const entry of entries) {
    const [rawName, ...rest] = entry.trim().split('=')
    if (rawName !== name) {
      continue
    }
    return decodeURIComponent(rest.join('='))
  }

  return null
}

export const getAcceptLanguageLocale = (acceptLanguage: string | null): SupportedLocale | undefined => {
  if (!acceptLanguage) return undefined

  const languages = new Negotiator({
    headers: {
      'accept-language': acceptLanguage,
    },
  }).languages()

  try {
    return match(languages, supportedLocales, defaultLocale) as SupportedLocale
  } catch {
    return undefined
  }
}

export const getLocaleQueryParam = (url: string | URL | null | undefined): string | null => {
  if (!url) {
    return null
  }

  try {
    return new URL(url, 'https://valguide.local').searchParams.get(LOCALE_QUERY_PARAM_NAME)
  } catch {
    return null
  }
}

export const resolveLocaleState = ({ headers, url }: ResolveLocaleStateOptions): ResolvedLocaleState => {
  const queryLocale = getLocaleQueryParam(url)
  const cookieLocale = getCookieValue(headers?.get('cookie') ?? null, LOCALE_COOKIE_NAME)

  if (isSupportedLocale(queryLocale)) {
    return {
      locale: queryLocale,
      hasLocaleCookie: isSupportedLocale(cookieLocale),
      source: 'query-param',
    }
  }

  if (isSupportedLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      hasLocaleCookie: true,
      source: 'cookie',
    }
  }

  const acceptLanguage = headers?.get('accept-language') ?? null
  const acceptLocale = getAcceptLanguageLocale(acceptLanguage)
  if (acceptLocale) {
    return {
      locale: acceptLocale,
      hasLocaleCookie: false,
      source: 'accept-language',
    }
  }

  return {
    locale: defaultLocale,
    hasLocaleCookie: false,
    source: 'default',
  }
}

export const resolveLocaleStateFromHeaders = (headers: Headers | null | undefined): ResolvedLocaleState => {
  return resolveLocaleState({ headers })
}

export const resolveLocaleFromHeaders = (headers: Headers | null | undefined): SupportedLocale => {
  return resolveLocaleStateFromHeaders(headers).locale
}

export const resolveLocaleStateFromHeadersAndUrl = (
  headers: Headers | null | undefined,
  url: string | URL | null | undefined,
): ResolvedLocaleState => {
  return resolveLocaleState({ headers, url })
}

export const resolveLocaleFromHeadersAndUrl = (
  headers: Headers | null | undefined,
  url: string | URL | null | undefined,
): SupportedLocale => {
  return resolveLocaleStateFromHeadersAndUrl(headers, url).locale
}

export const resolveLocaleStateFromRequest = (request: Request): ResolvedLocaleState => {
  return resolveLocaleStateFromHeadersAndUrl(request.headers, request.url)
}

export const resolveLocaleFromRequest = (request: Request): SupportedLocale => {
  return resolveLocaleStateFromRequest(request).locale
}
