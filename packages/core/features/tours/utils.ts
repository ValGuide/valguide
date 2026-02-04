// =============================================================================
// LOCALE FALLBACK PRIORITY
// =============================================================================

/**
 * Priority order for locale fallback when preferred locale is missing.
 * Used in SQL CASE expressions for picking the best available title.
 */
export const LOCALE_PRIORITY = ['en', 'de', 'rm'] as const

/**
 * Pick the best locale from an array based on fallback priority.
 * Useful for client-side title resolution when all locales are loaded.
 *
 * @param preferredLocale - The user's preferred locale
 * @param locales - Array of locale objects with locale and title properties
 * @returns The locale object with the best available title, or undefined if empty
 */
export function pickBestLocale<T extends { locale: string; title: string | null }>(
  preferredLocale: string,
  locales: T[],
): T | undefined {
  if (locales.length === 0) return undefined

  // 1. Preferred locale with title
  const preferred = locales.find((l) => l.locale === preferredLocale && l.title?.trim())
  if (preferred) return preferred

  // 2. Fallback priority (en → de → rm) with title
  for (const fallback of LOCALE_PRIORITY) {
    if (fallback === preferredLocale) continue
    const found = locales.find((l) => l.locale === fallback && l.title?.trim())
    if (found) return found
  }

  // 3. Any locale with a title
  const anyWithTitle = locales.find((l) => l.title?.trim())
  if (anyWithTitle) return anyWithTitle

  // 4. First available locale (even without title)
  return locales[0]
}
