import { customAlphabet } from 'nanoid'

/**
 * Short code generator for short links.
 * 7 characters, base62 (0-9, A-Z, a-z) - no special characters.
 *
 * Shorter than valguideId (10 chars) for more compact QR codes and URLs.
 */
export const generateShortCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7)
