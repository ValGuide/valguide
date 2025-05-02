import createNextIntlPlugin from 'next-intl/plugin'
import vercelJson from './vercel.json' with { type: 'json' }

const proxyPostHog = process.env.NEXT_CONFIG_POSTHOG_PROXY === 'true'

if (proxyPostHog) {
  console.warn('Proxying PostHog', proxyPostHog)
}

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@valguide/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  rewrites() {
    return {
      beforeFiles: [
        // These rewrites are checked after headers/redirects
        // and before all files including _next/public files which
        // allows overriding page files
        ...(proxyPostHog ? vercelJson.rewrites : []),
      ],
    }
  },
}

export default withNextIntl(nextConfig)
