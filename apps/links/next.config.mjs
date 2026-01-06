import createNextIntlPlugin from 'next-intl/plugin'
import { rewrites as posthogRewrites } from '@valguide/core/posthog/rewrites.js'

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

  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },

  rewrites() {
    return {
      beforeFiles: [...posthogRewrites],
    }
  },
}

export default withNextIntl(nextConfig)
