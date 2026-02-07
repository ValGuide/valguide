/**
 * Utilities for detecting and differentiating between nanoIds and slugs.
 *
 * NanoIds: 10-character base62 alphanumeric (0-9, A-Z, a-z)
 * Slugs: lowercase alphanumeric with hyphens (e.g., "kunsthaus-zurich")
 */

/**
 * NanoId pattern: exactly 10 characters, alphanumeric (base62).
 * Example: "abc123XYZ9"
 */
export const NANO_ID_PATTERN = /^[0-9A-Za-z]{10}$/

/**
 * Slug pattern: lowercase alphanumeric with hyphens, no leading/trailing hyphens.
 * Example: "kunsthaus-zurich", "my-tour-2024"
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Check if a string looks like a nanoId (10-char alphanumeric).
 */
export function isNanoId(value: string): boolean {
  return NANO_ID_PATTERN.test(value)
}

/**
 * Check if a string looks like a slug (lowercase with hyphens).
 * Note: This returns true for valid slugs, but a nanoId that happens
 * to be all lowercase would also match. Use isNanoId first for disambiguation.
 */
export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

/**
 * Determine what type of identifier a string is.
 * Priority: nanoId > slug > unknown
 *
 * @returns 'nanoId' | 'slug' | 'unknown'
 */
export function detectIdentifierType(value: string): 'nanoId' | 'slug' | 'unknown' {
  if (isNanoId(value)) {
    return 'nanoId'
  }
  if (isSlug(value)) {
    return 'slug'
  }
  return 'unknown'
}
