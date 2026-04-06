import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { defaultLocale, type SupportedLocale, supportedLocales } from './i18n.config'

export const LOCALE_COOKIE_NAME = 'valguide-locale'
export type LocaleSource = 'cookie' | 'accept-language' | 'default'
export type ResolvedLocaleState = {
  locale: SupportedLocale
  hasLocaleCookie: boolean
  source: LocaleSource
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

export const resolveLocaleStateFromHeaders = (headers: Headers | null | undefined): ResolvedLocaleState => {
  const cookieLocale = getCookieValue(headers?.get('cookie') ?? null, LOCALE_COOKIE_NAME)
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

export const resolveLocaleFromHeaders = (headers: Headers | null | undefined): SupportedLocale => {
  return resolveLocaleStateFromHeaders(headers).locale
}
