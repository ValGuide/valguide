import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { SupportedLocale as AppSupportedLocale } from '@/i18n/i18n.config'
import { getMessages, SupportedLocale } from '@valguide/i18n/messages'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as unknown as AppSupportedLocale)) {
    locale = routing.defaultLocale
  }

  // Dynamically import only the messages for the requested locale
  const localeMessages = await getMessages(locale as SupportedLocale)

  return {
    locale,
    messages: localeMessages,
  }
})
