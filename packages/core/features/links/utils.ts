import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { short_links } from './schema'
import type { CreateShortLinkInput } from './types'

export const MAX_RETRIES = 5

/**
 * Find an existing short link by its target criteria.
 * Uses type-specific matching based on the input type.
 */
export async function findShortLinkByTarget(input: CreateShortLinkInput) {
  switch (input.type) {
    case 'tour':
      return findTourShortLink(input.tourNanoId)
    case 'stop':
      return findStopShortLink(input.tourNanoId, input.stopNanoId)
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

async function findTourShortLink(tourNanoId: string) {
  const result = await db.query.short_links.findFirst({
    where: and(eq(short_links.type, 'tour'), eq(short_links.tourNanoId, tourNanoId)),
  })
  return result ?? null
}

async function findStopShortLink(tourNanoId: string, stopNanoId: string) {
  const result = await db.query.short_links.findFirst({
    where: and(
      eq(short_links.type, 'stop'),
      eq(short_links.tourNanoId, tourNanoId),
      eq(short_links.stopNanoId, stopNanoId),
    ),
  })
  return result ?? null
}

async function findCampaignShortLink(campaignId: string) {
  const result = await db.query.short_links.findFirst({
    where: and(eq(short_links.type, 'campaign'), eq(short_links.campaignId, campaignId)),
  })
  return result ?? null
}

async function findExternalShortLink(externalUrl: string) {
  const result = await db.query.short_links.findFirst({
    where: and(eq(short_links.type, 'external'), eq(short_links.externalUrl, externalUrl)),
  })
  return result ?? null
}

async function findLandingPageShortLink(pageSlug: string, locale: string) {
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
 * Build insert values for a new short link.
 */
export function buildInsertValues(input: CreateShortLinkInput, code: string) {
  const base = {
    code,
    type: input.type,
    target: input.target ?? {},
  }

  switch (input.type) {
    case 'tour':
      return { ...base, tourNanoId: input.tourNanoId, locale: null }
    case 'stop':
      return {
        ...base,
        tourNanoId: input.tourNanoId,
        stopNanoId: input.stopNanoId,
        locale: null,
      }
    case 'campaign':
      return { ...base, campaignId: input.campaignId }
    case 'external':
      return { ...base, externalUrl: input.externalUrl }
    case 'landing_page':
      return { ...base, pageSlug: input.pageSlug, locale: input.locale }
  }
}

/**
 * Check if error is a unique constraint violation (PostgreSQL error code 23505).
 */
export function isUniqueViolation(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as { code: string }).code === '23505'
  }
  return false
}
