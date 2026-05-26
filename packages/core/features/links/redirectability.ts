import type { ShortLink } from './schema'

function isExpired(link: Pick<ShortLink, 'expiresAt'>, now = new Date()): boolean {
  return !!link.expiresAt && link.expiresAt.getTime() <= now.getTime()
}

export function isShortLinkRedirectable(link: Pick<ShortLink, 'status' | 'archivedAt' | 'expiresAt'>): boolean {
  return link.status === 'active' && !link.archivedAt && !isExpired(link)
}
