import type { ShortLink } from './schema'

/**
 * Resolves a short link to its app path.
 * This is the ONLY place URL patterns are defined.
 *
 * @returns The path (relative or absolute for external), or null if type is unknown
 */
export function buildPathFromShortLink(link: ShortLink): string | null {
  switch (link.type) {
    case 'tour':
      if (!link.tourNanoId || !link.locale) return null
      return `/${link.locale}/g/${link.tourNanoId}`

    case 'stop':
      if (!link.tourNanoId || !link.stopNanoId || !link.locale) return null
      return `/${link.locale}/g/${link.tourNanoId}/s/${link.stopNanoId}`

    case 'campaign':
      if (!link.campaignId) return null
      return `/campaigns/${link.campaignId}`

    case 'landing_page':
      if (!link.pageSlug || !link.locale) return null
      return `/${link.locale}/${link.pageSlug}`

    case 'external':
      return link.externalUrl ?? null

    default:
      return null
  }
}

/**
 * Checks if a path is an absolute URL (external link)
 */
export function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path)
}
