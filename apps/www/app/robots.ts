import { serverEnv } from '@valguide/core/env/server'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const env = serverEnv.VERCEL_ENV ?? 'development'

  if (env === 'production') {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/internal'],
      },
    }
  }
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
