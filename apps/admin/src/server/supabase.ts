import type { CookieOptionsWithName } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { serverEnv } from '@valguide/core/env/server'

export const adminCookieOptions = (): CookieOptionsWithName => ({
  name: 'sb-admin-auth-token',
  domain: serverEnv.ADMIN_COOKIE_DOMAIN,
  path: '/',
  sameSite: 'strict',
  secure: true,
  httpOnly: true,
  maxAge: 60 * 60 * 4, // 4 hours
})

export async function createAdminClient() {
  return createServerClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookies: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookies.forEach((cookie) => {
          setCookie(cookie.name, cookie.value, cookie.options)
        })
      },
    },
    cookieOptions: adminCookieOptions(),
  })
}
