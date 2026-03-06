import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { defaultLocale, type SupportedLocale, supportedLocales } from './i18n.config'

export const LOCALE_COOKIE_NAME = 'valguide-locale'

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

export const resolveLocaleFromHeaders = (headers: Headers | null | undefined): SupportedLocale => {
  const cookieLocale = getCookieValue(headers?.get('cookie') ?? null, LOCALE_COOKIE_NAME)
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = headers?.get('accept-language') ?? null
  const acceptLocale = getAcceptLanguageLocale(acceptLanguage)
  if (acceptLocale) {
    return acceptLocale
  }

  return defaultLocale
}
