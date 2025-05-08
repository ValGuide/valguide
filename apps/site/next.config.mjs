import createNextIntlPlugin from 'next-intl/plugin'
import { rewrites as posthotRewrites } from '../../packages/core/posthog/rewrites.js'

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
      beforeFiles: [...posthotRewrites],
    }
  },
}

export default withNextIntl(nextConfig)
