import { z } from 'zod'

/**
 * German-specific replacements (applied before NFD normalization).
 * Must replace ä→ae BEFORE NFD would decompose it to a+combining-umlaut.
 */
const GERMAN_MAP: Record<string, string> = {
  ä: 'ae',
  Ä: 'Ae',
  ö: 'oe',
  Ö: 'Oe',
  ü: 'ue',
  Ü: 'Ue',
  ß: 'ss',
  ẞ: 'Ss',
}

/**
 * Reserved slugs that cannot be used for organizations or tours.
 * These are reserved for system routes and common paths.
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'app',
  'auth',
  'login',
  'logout',
  'signup',
  'settings',
  'help',
  'support',
  'about',
  'contact',
  'terms',
  'privacy',
  'tours',
  'stops',
  'assets',
  'new',
  'edit',
  'delete',
  'studio',
  'links',
  'explore',
  'search',
  'dashboard',
  'profile',
  'account',
  'billing',
  'invite',
  'join',
  'team',
  'teams',
  'org',
  'orgs',
  'organization',
  'organizations',
] as const

/**
 * Generate a URL-safe slug from text.
 *
 * - German umlauts: ä→ae, ö→oe, ü→ue, ß→ss
 * - Accents: NFD normalization + \p{Diacritic} removal
 * - Dashes: All Unicode dash types normalized to hyphen
 * - Contractions: don't → dont, it's → its
 * - Output: lowercase alphanumeric with hyphens only
 *
 * @example
 * generateSlug("Kunsthaus Zürich")        → "kunsthaus-zuerich"
 * generateSlug("Highlights-Führung")      → "highlights-fuehrung"
 * generateSlug("Große Ausstellung")       → "grosse-ausstellung"
 * generateSlug("La Chaux-de-Fonds")       → "la-chaux-de-fonds"
 * generateSlug("Musée d'Orsay")           → "musee-d-orsay"
 * generateSlug("Château de Versailles")   → "chateau-de-versailles"
 * generateSlug("naïve café résumé")       → "naive-cafe-resume"
 * generateSlug("En–dash and em—dash")     → "en-dash-and-em-dash"
 * generateSlug("don't miss")              → "dont-miss"
 */
export function generateSlug(text: string): string {
  let result = text.normalize()

  // 1. German-specific replacements (before NFD strips them)
  for (const [char, replacement] of Object.entries(GERMAN_MAP)) {
    result = result.replaceAll(char, replacement)
  }

  // 2. NFD normalize → strip all diacritics (accents, umlauts, etc.)
  result = result.normalize('NFD').replaceAll(/\p{Diacritic}/gu, '')

  // 3. Normalize all Unicode dash types (en-dash, em-dash, etc.) to hyphen
  result = result.replaceAll(/\p{Dash_Punctuation}/gu, '-')

  // 4. Remove contractions: don't → dont, it's → its
  result = result.replaceAll(/([a-zA-Z\d])['\u2019]([ts])\b/g, '$1$2')

  // 5. Lowercase
  result = result.toLowerCase()

  // 6. Replace any non-alphanumeric sequences with single hyphen
  result = result.replaceAll(/[^a-z0-9]+/g, '-')

  // 7. Remove leading/trailing hyphens
  return result.replace(/^-+|-+$/g, '')
}

/**
 * Regex pattern for valid slugs: lowercase alphanumeric with hyphens,
 * no leading/trailing hyphens, no consecutive hyphens.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Zod schema for validating slugs.
 * - 3-100 characters
 * - Lowercase alphanumeric with hyphens
 * - No leading/trailing hyphens
 * - No consecutive hyphens
 * - Not a reserved slug
 */
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(SLUG_PATTERN, 'Slug must be lowercase alphanumeric with hyphens (e.g., "my-tour-name")')
  .refine((slug) => !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]), {
    message: 'This slug is reserved',
  })

/**
 * Check if a slug is valid without throwing.
 */
export function isValidSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success
}

/**
 * Error class for slug conflicts.
 */
export class SlugTakenError extends Error {
  constructor(
    public readonly slug: string,
    public readonly scope: 'organization' | 'tour',
  ) {
    const message =
      scope === 'organization'
        ? 'This slug is already taken by another organization'
        : 'You already used this slug for another tour'
    super(message)
    this.name = 'SlugTakenError'
  }
}
