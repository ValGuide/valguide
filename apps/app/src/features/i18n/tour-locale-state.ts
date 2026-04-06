import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'

export type TourLocaleState = {
  currentLocale: SupportedLocale
  availableLocales: SupportedLocale[]
  hasLocaleCookie: boolean
  isCurrentLocaleSupported: boolean
  shouldForceSelection: boolean
  shouldPromptInitialSelection: boolean
  preferredSelectionLocale: SupportedLocale
}

export function resolveTourLocaleState(input: {
  currentLocale: SupportedLocale
  hasLocaleCookie: boolean
  availableLocales: string[]
}): TourLocaleState {
  const availableLocales = input.availableLocales.filter((locale): locale is SupportedLocale =>
    supportedLocales.includes(locale as SupportedLocale),
  )

  const fallbackLocale =
    availableLocales[0] ?? (supportedLocales.includes(input.currentLocale) ? input.currentLocale : defaultLocale)
  const isCurrentLocaleSupported = availableLocales.includes(input.currentLocale)

  return {
    currentLocale: input.currentLocale,
    availableLocales,
    hasLocaleCookie: input.hasLocaleCookie,
    isCurrentLocaleSupported,
    shouldForceSelection: input.hasLocaleCookie && !isCurrentLocaleSupported,
    shouldPromptInitialSelection: !input.hasLocaleCookie,
    preferredSelectionLocale: isCurrentLocaleSupported ? input.currentLocale : fallbackLocale,
  }
}
