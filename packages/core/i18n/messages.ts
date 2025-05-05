import { SupportedLocale, supportedLocales } from './i18n.config'

// Function to dynamically import messages for a specific locale
export const getMessages = async (locale: SupportedLocale) => {
  if (supportedLocales.includes(locale)) {
    return (await import(`./messages/${locale}.json`)).default
  }
  return (await import('./messages/en.json')).default
}
