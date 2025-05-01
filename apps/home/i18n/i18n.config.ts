import { supportedLocales, defaultLocale, SupportedLocale } from '@valguide/i18n/messages'

export { supportedLocales, defaultLocale }

export type { SupportedLocale }

export const i18nStaticParams = supportedLocales.map((locale) => ({ locale }))
