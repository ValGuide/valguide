import { queryOptions } from '@tanstack/react-query'
import { getMessagesFn } from './get-messages'
import type { SupportedLocale } from './i18n.config'
import { resolveLocaleFn } from './resolve-locale'

export const localeQueryOptions = () =>
  queryOptions<SupportedLocale>({
    queryKey: ['locale'],
    queryFn: () => resolveLocaleFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes - locale rarely changes during a session
  })

export const messagesQueryOptions = (locale: SupportedLocale) =>
  queryOptions({
    queryKey: ['i18n-messages', locale],
    queryFn: () => getMessagesFn({ data: { locale } }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
