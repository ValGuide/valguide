import { getCookie, getRequestHeaders, setCookie } from '@tanstack/react-start/server'
import { defaultLocale, type SupportedLocale } from './i18n.config'
import {
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  resolveLocaleFromHeaders,
  resolveLocaleFromRequest,
  resolveLocaleStateFromHeaders,
  resolveLocaleStateFromRequest,
} from './locale-resolution'

export const resolveServerLocale = (request?: Request): SupportedLocale => {
  if (request) {
    return resolveLocaleFromRequest(request)
  }

  const cookieLocale = getCookie(LOCALE_COOKIE_NAME)
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  try {
    return resolveLocaleFromHeaders(getRequestHeaders())
  } catch {
    return defaultLocale
  }
}

export const resolveServerLocaleState = (request?: Request) => {
  if (request) {
    return resolveLocaleStateFromRequest(request)
  }

  const cookieLocale = getCookie(LOCALE_COOKIE_NAME)
  if (isSupportedLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      hasLocaleCookie: true,
      source: 'cookie' as const,
    }
  }

  try {
    return resolveLocaleStateFromHeaders(getRequestHeaders())
  } catch {
    return {
      locale: defaultLocale,
      hasLocaleCookie: false,
      source: 'default' as const,
    }
  }
}

export const setServerLocale = (locale: SupportedLocale): void => {
  setCookie(LOCALE_COOKIE_NAME, locale, {
    sameSite: 'lax',
    maxAge: 31536000,
    path: '/',
  })
}
