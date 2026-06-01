import { defaultLocale } from './i18n.config'
import {
  resolveLocaleFromHeaders,
  resolveLocaleFromHeadersAndUrl,
  resolveLocaleStateFromHeaders,
  resolveLocaleStateFromHeadersAndUrl,
} from './locale-resolution'

describe('resolveLocaleFromHeaders', () => {
  it('prefers locale cookie over accept-language', () => {
    const headers = new Headers({
      cookie: 'foo=bar; valguide-locale=rm',
      'accept-language': 'de-CH,de;q=0.9,en;q=0.8',
    })

    expect(resolveLocaleFromHeaders(headers)).toBe('rm')
  })

  it('uses accept-language when cookie is missing', () => {
    const headers = new Headers({
      'accept-language': 'de-CH,de;q=0.9,en;q=0.8',
    })

    expect(resolveLocaleFromHeaders(headers)).toBe('de')
  })

  it('ignores unsupported cookie locale and falls back to accept-language', () => {
    const headers = new Headers({
      cookie: 'valguide-locale=fr',
      'accept-language': 'de-CH,de;q=0.9',
    })

    expect(resolveLocaleFromHeaders(headers)).toBe('de')
  })

  it('falls back to default locale when no valid locale source exists', () => {
    const headers = new Headers({
      cookie: 'valguide-locale=fr',
      'accept-language': 'fr-FR,fr;q=0.9',
    })

    expect(resolveLocaleFromHeaders(headers)).toBe(defaultLocale)
  })

  it('prefers supported hl query param over cookie and accept-language', () => {
    const headers = new Headers({
      cookie: 'foo=bar; valguide-locale=rm',
      'accept-language': 'en-US,en;q=0.9',
    })

    expect(resolveLocaleFromHeadersAndUrl(headers, '/?hl=de')).toBe('de')
  })

  it('ignores unsupported hl query param and falls back to cookie', () => {
    const headers = new Headers({
      cookie: 'valguide-locale=rm',
      'accept-language': 'de-CH,de;q=0.9',
    })

    expect(resolveLocaleFromHeadersAndUrl(headers, '/?hl=fr')).toBe('rm')
  })
})

describe('resolveLocaleStateFromHeaders', () => {
  it('marks cookie-backed locale selections as persisted', () => {
    const headers = new Headers({
      cookie: 'foo=bar; valguide-locale=rm',
      'accept-language': 'de-CH,de;q=0.9,en;q=0.8',
    })

    expect(resolveLocaleStateFromHeaders(headers)).toEqual({
      locale: 'rm',
      hasLocaleCookie: true,
      source: 'cookie',
    })
  })

  it('marks accept-language derived locales as not persisted', () => {
    const headers = new Headers({
      'accept-language': 'de-CH,de;q=0.9,en;q=0.8',
    })

    expect(resolveLocaleStateFromHeaders(headers)).toEqual({
      locale: 'de',
      hasLocaleCookie: false,
      source: 'accept-language',
    })
  })

  it('marks query-param derived locales as explicit URL selections', () => {
    const headers = new Headers({
      cookie: 'foo=bar; valguide-locale=rm',
      'accept-language': 'en-US,en;q=0.9',
    })

    expect(resolveLocaleStateFromHeadersAndUrl(headers, 'https://studio.valguide.com/tours?hl=de')).toEqual({
      locale: 'de',
      hasLocaleCookie: true,
      source: 'query-param',
    })
  })
})
