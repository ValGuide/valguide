type LocaleFallback = {
  english: string
  native: string
}

export type LocalePresentation = {
  localeCode: string
  localizedName: string
  nativeName: string
}

const localeFallbacks: Partial<Record<string, LocaleFallback>> = {
  rm: {
    english: 'Romansh',
    native: 'Romontsch',
  },
}

function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase()
}

function getFallback(locale: string): LocaleFallback | undefined {
  return localeFallbacks[normalizeLocale(locale)]
}

function getIntlDisplayName(locale: string, displayLocale: string): string | undefined {
  if (!('DisplayNames' in Intl)) {
    return undefined
  }

  try {
    const displayNames = new Intl.DisplayNames([displayLocale], { type: 'language' })
    const name = displayNames.of(locale)

    if (!name) {
      return undefined
    }

    if (normalizeLocale(name) === normalizeLocale(locale)) {
      return undefined
    }

    return name
  } catch {
    return undefined
  }
}

function getLocaleName(locale: string, displayLocale: string, fallbackName?: string): string {
  return getIntlDisplayName(locale, displayLocale) ?? fallbackName ?? locale.toUpperCase()
}

export function getLocaleDisplayName(locale: string, displayLocale = 'en'): string {
  return getLocaleName(locale, displayLocale, getFallback(locale)?.english)
}

export function getLocaleNativeName(locale: string): string {
  const fallback = getFallback(locale)
  return fallback?.native ?? getLocaleName(locale, locale, fallback?.english)
}

export function getLocalePresentation(locale: string, displayLocale = 'en'): LocalePresentation {
  return {
    localeCode: locale,
    localizedName: getLocaleDisplayName(locale, displayLocale),
    nativeName: getLocaleNativeName(locale),
  }
}
