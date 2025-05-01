import type { MetadataRoute } from 'next'
import { internalRoutes, protectedRoutes } from '@/routes/routes'

export default function robots(): MetadataRoute.Robots {
  const env = process.env.VERCEL_ENV || 'development'

  if (env === 'production') {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [...internalRoutes, ...protectedRoutes],
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
