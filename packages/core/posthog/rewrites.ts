import type { VercelConfig } from '@vercel/config/v1/types'

type Rewrite = NonNullable<VercelConfig['rewrites']>[number]

/**
 * PostHog rewrites to proxy analytics requests through our domain.
 * This avoids ad blockers and keeps data on first-party domain.
 *
 * Uses PostHog EU servers (Frankfurt) for GDPR compliance.
 */
export const posthogRewrites: Rewrite[] = [
  {
    source: '/ingest/static/:path*',
    destination: 'https://eu-assets.i.posthog.com/static/:path*',
  },
  {
    source: '/ingest/:path*',
    destination: 'https://eu.i.posthog.com/:path*',
  },
]
