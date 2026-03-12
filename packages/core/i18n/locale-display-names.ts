type LocaleFallback = {
  english: string
  native: string
}

const localeFallbacks: Partial<Record<string, LocaleFallback>> = {
  rm: {
    english: 'Romansh',
    native: 'Rumantsch',
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

export function getLocaleDisplayName(locale: string, displayLocale = 'en'): string {
  return getIntlDisplayName(locale, displayLocale) ?? getFallback(locale)?.english ?? locale.toUpperCase()
}

export function getLocaleNativeName(locale: string): string {
  return getIntlDisplayName(locale, locale) ?? getFallback(locale)?.native ?? getLocaleDisplayName(locale)
}
