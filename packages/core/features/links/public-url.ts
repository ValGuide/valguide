/**
 * Build the external short link URL for use in QR codes.
 *
 * @param linksBaseUrl - The base URL of the links service (e.g., "https://vg.li")
 * @param code - The short code
 * @returns The full short link URL (e.g., "https://vg.li/abc1234")
 */
export function buildShortLinkUrl(linksBaseUrl: string, code: string): string {
  const base = linksBaseUrl.replace(/\/+$/, '')
  return `${base}/${code}`
}
