export const supportedLocales = ['en', 'de', 'rm'] as const

export type SupportedLocale = (typeof supportedLocales)[number]

export const defaultLocale: SupportedLocale = 'en'

export const i18nStaticParams = supportedLocales.map((locale) => ({ locale }))
