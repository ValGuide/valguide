import { db } from '../db'
import { generateShortCode } from './generator'
import type { ShortLink } from './schema'
import { short_links } from './schema'
import type { CreateShortLinkInput } from './types'
import { buildInsertValues, findShortLinkByTarget, isUniqueViolation, MAX_RETRIES } from './utils'

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

      const existing = await findShortLinkByTarget(input)
      if (existing) {
        return existing
      }
    }
  }

  throw new Error('Failed to generate unique short code after multiple attempts')
}

// =============================================================================
// CONVENIENCE WRAPPERS
// =============================================================================

export async function getOrCreateTourShortLink(tourNanoId: string, organizationId?: string): Promise<ShortLink> {
  const resolvedOrganizationId = organizationId ?? (await getTourOrganizationId(tourNanoId))
  return getOrCreateShortLink({
    type: 'tour',
    tourNanoId,
    organizationId: resolvedOrganizationId,
    title: 'Tour QR',
    target: { source: 'qr' },
  })
}

export async function getOrCreateStopShortLink(
  tourNanoId: string,
  stopNanoId: string,
  organizationId?: string,
): Promise<ShortLink> {
  const resolvedOrganizationId = organizationId ?? (await getStopOrganizationId(stopNanoId))
  return getOrCreateShortLink({
    type: 'stop',
    tourNanoId,
    stopNanoId,
    organizationId: resolvedOrganizationId,
    title: 'Stop QR',
    target: { source: 'qr' },
  })
}

async function getTourOrganizationId(tourNanoId: string): Promise<string | null> {
  const row = await db.query.tour.findFirst({
    columns: { organizationId: true },
    where: (fields, { eq }) => eq(fields.nanoId, tourNanoId),
  })
  return row?.organizationId ?? null
}

async function getStopOrganizationId(stopNanoId: string): Promise<string | null> {
  const row = await db.query.stop.findFirst({
    columns: { organizationId: true },
    where: (fields, { eq }) => eq(fields.nanoId, stopNanoId),
  })
  return row?.organizationId ?? null
}
