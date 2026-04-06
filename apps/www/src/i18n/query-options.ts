import { queryOptions } from '@tanstack/react-query'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { getWwwMessagesFn } from './get-www-messages.fn'

export const wwwMessagesQueryOptions = (locale: SupportedLocale) =>
  queryOptions({
    queryKey: ['www-messages', locale],
    queryFn: () => getWwwMessagesFn({ data: { locale } }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
