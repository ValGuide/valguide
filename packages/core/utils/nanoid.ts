import { customAlphabet } from 'nanoid'

/**
 * Standard alphanumeric ID generator for ValGuide.
 * 10 characters, base62 (0-9, A-Z, a-z) - no special characters.
 *
 * Use this for all non-security IDs: guides, stops, assets, versions, etc.
 * Do NOT use for auth tokens, API keys, or security-sensitive identifiers.
 */
export const valguideId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)
