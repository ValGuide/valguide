/**
 * Build the external short link URL for use in QR codes.
 *
 * @param linksBaseUrl - The base URL of the links service (e.g., "https://links.valguide.com")
 * @param code - The short code
 * @returns The full short link URL (e.g., "https://links.valguide.com/s/abc1234")
 */
export function buildShortLinkUrl(linksBaseUrl: string, code: string): string {
  const base = linksBaseUrl.replace(/\/+$/, '')
  return `${base}/s/${code}`
}

export function getDefaultLinksBaseUrl(environment: 'local' | 'dev' | 'prod'): string {
  return environment === 'prod' ? 'https://links.valguide.com' : 'https://links.valguide.dev'
}
