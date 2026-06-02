import { queryOptions } from '@tanstack/react-query'
import { getMessagesFn } from './get-messages.fn'
import type { SupportedLocale } from './i18n.config'
import type { ResolvedLocaleState } from './locale-resolution'
import { resolveLocaleFn } from './resolve-locale.fn'
import { resolveLocaleStateFn } from './resolve-locale-state.fn'

function getLocaleQueryParam(url: string | undefined): string | null {
  if (!url) {
    return null
  }

  try {
    return new URL(url, 'https://valguide.local').searchParams.get('hl')
  } catch {
    return null
  }
}

export const localeQueryOptions = (href?: string) =>
  queryOptions<SupportedLocale>({
    queryKey: ['locale', getLocaleQueryParam(href)],
    queryFn: () => resolveLocaleFn({ data: { href } }),
    staleTime: 5 * 60 * 1000, // 5 minutes - locale rarely changes during a session
    retry: false, // fail fast in beforeLoad — retries would brick the app
  })

export const messagesQueryOptions = (locale: SupportedLocale) =>
  queryOptions({
    queryKey: ['i18n-messages', locale],
    queryFn: () => getMessagesFn({ data: { locale } }),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })

export const localeStateQueryOptions = () =>
  queryOptions<ResolvedLocaleState>({
    queryKey: ['locale-state'],
    queryFn: () => resolveLocaleStateFn(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
