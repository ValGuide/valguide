export const emailLocales = ['en', 'de', 'rm'] as const

export type EmailLocale = (typeof emailLocales)[number]

export const defaultEmailLocale: EmailLocale = 'en'

export const isEmailLocale = (value: string | null | undefined): value is EmailLocale =>
  emailLocales.includes(value as EmailLocale)
