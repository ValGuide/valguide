import { queryOptions } from '@tanstack/react-query'
import type { SupportedLocale } from './i18n.config'
import { getMessagesFn } from './server-functions'

export const messagesQueryOptions = (locale: SupportedLocale) =>
  queryOptions({
    queryKey: ['i18n-messages', locale],
    queryFn: () => getMessagesFn({ data: { locale } }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
