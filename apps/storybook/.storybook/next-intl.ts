import en from '@valguide/i18n/messages/en.json' with { type: 'json' }
import de from '@valguide/i18n/messages/de.json' with { type: 'json' }
import rm from '@valguide/i18n/messages/rm.json' with { type: 'json' }
import { SupportedLocale } from '@valguide/i18n/i18n.config'

const messagesByLocale: Record<SupportedLocale, any> = { en, de, rm }

const nextIntl = {
  defaultLocale: 'en',
  messagesByLocale,
}

export default nextIntl
