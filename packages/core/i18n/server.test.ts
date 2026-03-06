import { defaultLocale } from './i18n.config'
import { resolveLocaleFromHeaders } from './locale-resolution'

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
})
