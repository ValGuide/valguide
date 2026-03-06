import { getCookie, getRequestHeaders, setCookie } from '@tanstack/react-start/server'
import { defaultLocale, type SupportedLocale } from './i18n.config'
import {
  getAcceptLanguageLocale,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  resolveLocaleFromHeaders,
} from './locale-resolution'

export { LOCALE_COOKIE_NAME, getAcceptLanguageLocale, isSupportedLocale, resolveLocaleFromHeaders }

export const resolveServerLocale = (request?: Request): SupportedLocale => {
  const cookieLocale = getCookie(LOCALE_COOKIE_NAME)
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  if (request) {
    return resolveLocaleFromHeaders(request.headers)
  }

  try {
    return resolveLocaleFromHeaders(getRequestHeaders())
  } catch {
    return defaultLocale
  }
}

export const setServerLocale = (locale: SupportedLocale): void => {
  setCookie(LOCALE_COOKIE_NAME, locale, {
    sameSite: 'lax',
    maxAge: 31536000,
    path: '/',
  })
}
