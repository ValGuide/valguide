import { db } from '../db'
import { generateShortCode } from './generator'
import type { ShortLink } from './schema'
import { short_links } from './schema'
import type { CreateShortLinkInput } from './types'
import { buildInsertValues, findShortLinkByTarget, isUniqueViolation, MAX_RETRIES } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type GetOrCreateShortLinkResult = ShortLink

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get or create a short link for any target type.
 * If a link already exists for the target, returns it.
 * Otherwise, creates a new one with a unique short code.
 */
export async function getOrCreateShortLink(input: CreateShortLinkInput): Promise<ShortLink> {
  const existing = await findShortLinkByTarget(input)
  if (existing) return existing

  return createShortLink(input)
}

async function createShortLink(input: CreateShortLinkInput): Promise<ShortLink> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = generateShortCode()

    try {
      const values = buildInsertValues(input, code)
      const [result] = await db.insert(short_links).values(values).returning()
      if (!result) {
        throw new Error('Failed to create short link')
      }
      return result
    } catch (err: unknown) {
      if (!isUniqueViolation(err)) {
        throw err
      }
    }
  }

  throw new Error('Failed to generate unique short code after multiple attempts')
}

// =============================================================================
// CONVENIENCE WRAPPERS
// =============================================================================

export async function getOrCreateTourShortLink(tourNanoId: string, locale: string): Promise<ShortLink> {
  return getOrCreateShortLink({ type: 'tour', tourNanoId, locale })
}

export async function getOrCreateStopShortLink(
  tourNanoId: string,
  stopNanoId: string,
  locale: string,
): Promise<ShortLink> {
  return getOrCreateShortLink({ type: 'stop', tourNanoId, stopNanoId, locale })
}
