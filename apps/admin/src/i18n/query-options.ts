import { queryOptions } from '@tanstack/react-query'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { getAdminMessagesFn } from './get-admin-messages.fn'

export const adminMessagesQueryOptions = (locale: SupportedLocale) =>
  queryOptions({
    queryKey: ['admin-messages', locale],
    queryFn: () => getAdminMessagesFn({ data: { locale } }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
