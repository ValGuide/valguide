import { match } from '@formatjs/intl-localematcher'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import Negotiator from 'negotiator'
import { defaultLocale, type SupportedLocale, supportedLocales } from './i18n.config'

export const LOCALE_COOKIE_NAME = 'valguide-locale'

export const isSupportedLocale = (locale: string | undefined | null): locale is SupportedLocale =>
  supportedLocales.includes(locale as SupportedLocale)

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

export const resolveServerLocale = (request?: Request): SupportedLocale => {
  const cookieLocale = getCookie(LOCALE_COOKIE_NAME)
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = request?.headers.get('accept-language') ?? null
  const acceptLocale = getAcceptLanguageLocale(acceptLanguage)
  if (acceptLocale) {
    return acceptLocale
  }

  return defaultLocale
}

export const setServerLocale = (locale: SupportedLocale): void => {
  setCookie(LOCALE_COOKIE_NAME, locale, {
    sameSite: 'lax',
    maxAge: 31536000,
    path: '/',
  })
}
