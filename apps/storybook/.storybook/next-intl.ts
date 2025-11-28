import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import de from '@valguide/i18n/messages/de.json'
import en from '@valguide/i18n/messages/en.json'
import rm from '@valguide/i18n/messages/rm.json'

const messagesByLocale: Record<SupportedLocale, typeof en> = { en, de, rm }

const nextIntl = {
  defaultLocale: 'en',
  messagesByLocale,
}

export default nextIntl
