import type { CookieOptionsWithName } from '@supabase/ssr'

export const cookieOptions: CookieOptionsWithName = {
  name: 'sb-auth-token',
  domain: process.env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN,
  path: '/',
  sameSite: 'lax',
  secure: true,
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 1 week (notice: doesn't seem to work)
}
