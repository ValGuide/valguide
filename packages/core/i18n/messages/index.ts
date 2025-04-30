// Define supported locales
export const supportedLocales = ['en', 'de', 'rm'] as const
export type SupportedLocale = (typeof supportedLocales)[number]
export const defaultLocale: SupportedLocale = 'en'

// Function to dynamically import messages for a specific locale
export async function getMessages(locale: SupportedLocale) {
  if (supportedLocales.includes(locale)) {
    return (await import(`./${locale}.json`)).default
  }
  return (await import('./en.json')).default
}
