import { customAlphabet } from 'nanoid'
import { uuidv7 } from 'uuidv7'

/**
 * Standard alphanumeric ID generator for ValGuide.
 * 10 characters, base62 (0-9, A-Z, a-z) - no special characters.
 *
 * Use this for all non-security IDs: tours, stops, assets, versions, etc.
 * Do NOT use for auth tokens, API keys, or security-sensitive identifiers.
 */
export const valguideId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

/**
 * Generate a UUIDv7 for versioning.
 * UUIDv7 embeds timestamp in first 48 bits, providing:
 * - Natural chronological ordering
 * - Extractable creation time
 * - Globally unique identifiers
 *
 * Use for version identifiers where ordering matters.
 */
export const valguideVersionId = uuidv7
