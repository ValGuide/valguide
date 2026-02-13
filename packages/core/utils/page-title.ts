import { clientEnv } from '@valguide/core/env/client'

/**
 * Prepends environment label to page title if not production.
 *
 * Examples:
 * - production: "Tour Name — ValGuide"
 * - development: "[DEV] Tour Name — ValGuide"
 * - staging: "[STAGING] Tour Name — ValGuide"
 */
export function getPrefixedTitle(baseTitle: string): string {
  if (clientEnv.VITE_ENV === 'dev' || clientEnv.VITE_ENV === 'local') {
    const prefix = clientEnv.VITE_ENV.toUpperCase()
    return `[${prefix}] ${baseTitle}`
  }
  return baseTitle
}
