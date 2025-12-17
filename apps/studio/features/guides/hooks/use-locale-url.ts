import { defaultLocale } from '@valguide/i18n/i18n.config'
import { useCallback } from 'react'

const LOCALE_PARAM = 'locale'

export function useLocaleUrl(activeLocale: string) {
  const buildUrl = useCallback(
    (path: string) => {
      if (activeLocale === defaultLocale) {
        return path
      }
      const url = new URL(path, 'http://localhost')
      url.searchParams.set(LOCALE_PARAM, activeLocale)
      return `${url.pathname}${url.search}`
    },
    [activeLocale],
  )

  return { buildUrl }
}
