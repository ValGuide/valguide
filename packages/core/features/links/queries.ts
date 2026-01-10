import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { generateShortCode } from './generator'
import { type ShortLink, short_links } from './schema'
import type { CreateShortLinkInput } from './types'

const MAX_RETRIES = 5

/**
 * Find an existing short link by its target criteria.
 * Uses type-specific matching based on the input type.
 */
export async function findShortLinkByTarget(input: CreateShortLinkInput): Promise<ShortLink | null> {
  switch (input.type) {
    case 'guide':
      return findGuideShortLink(input.guideNanoId, input.locale)
    case 'stop':
      return findStopShortLink(input.guideNanoId, input.stopNanoId, input.locale)
    case 'campaign':
      return findCampaignShortLink(input.campaignId)
    case 'external':
      return findExternalShortLink(input.externalUrl)
    case 'landing_page':
      return findLandingPageShortLink(input.pageSlug, input.locale)
    default:
      return null
  }
}

async function findGuideShortLink(guideNanoId: string, locale: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: and(eq(short_links.type, 'guide'), eq(short_links.guideNanoId, guideNanoId), eq(short_links.locale, locale)),
  })
  return result ?? null
}

async function findStopShortLink(guideNanoId: string, stopNanoId: string, locale: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: and(
      eq(short_links.type, 'stop'),
      eq(short_links.guideNanoId, guideNanoId),
      eq(short_links.stopNanoId, stopNanoId),
      eq(short_links.locale, locale),
    ),
  })
  return result ?? null
}

async function findCampaignShortLink(campaignId: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: and(eq(short_links.type, 'campaign'), eq(short_links.campaignId, campaignId)),
  })
  return result ?? null
}

async function findExternalShortLink(externalUrl: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: and(eq(short_links.type, 'external'), eq(short_links.externalUrl, externalUrl)),
  })
  return result ?? null
}

async function findLandingPageShortLink(pageSlug: string, locale: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: and(
      eq(short_links.type, 'landing_page'),
      eq(short_links.pageSlug, pageSlug),
      eq(short_links.locale, locale),
    ),
  })
  return result ?? null
}

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

/**
 * Create a new short link with retry on code collision.
 */
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

function buildInsertValues(input: CreateShortLinkInput, code: string) {
  const base = {
    code,
    type: input.type,
    target: input.target ?? {},
  }

  switch (input.type) {
    case 'guide':
      return { ...base, guideNanoId: input.guideNanoId, locale: input.locale }
    case 'stop':
      return {
        ...base,
        guideNanoId: input.guideNanoId,
        stopNanoId: input.stopNanoId,
        locale: input.locale,
      }
    case 'campaign':
      return { ...base, campaignId: input.campaignId }
    case 'external':
      return { ...base, externalUrl: input.externalUrl }
    case 'landing_page':
      return { ...base, pageSlug: input.pageSlug, locale: input.locale }
  }
}

function isUniqueViolation(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as { code: string }).code === '23505'
  }
  return false
}

// Convenience wrappers

export async function getOrCreateGuideShortLink(guideNanoId: string, locale: string): Promise<ShortLink> {
  return getOrCreateShortLink({ type: 'guide', guideNanoId, locale })
}

export async function getOrCreateStopShortLink(
  guideNanoId: string,
  stopNanoId: string,
  locale: string,
): Promise<ShortLink> {
  return getOrCreateShortLink({ type: 'stop', guideNanoId, stopNanoId, locale })
}

/**
 * Get a short link by its code (for resolution in links app)
 */
export async function getShortLinkByCode(code: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: eq(short_links.code, code),
  })
  return result ?? null
}

/**
 * Get all short links for a guide (any type - guide or stop level)
 */
export async function getShortLinksForGuide(guideNanoId: string): Promise<ShortLink[]> {
  return db.query.short_links.findMany({
    where: eq(short_links.guideNanoId, guideNanoId),
  })
}
