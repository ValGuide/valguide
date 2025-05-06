import type { CookieOptionsWithName } from '@supabase/ssr'

export const cookieOptions: CookieOptionsWithName = {
  name: 'sb-auth-token',
  domain: process.env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NEXT_PUBLIC_SUPABASE_COOKIE_SECURE !== 'false',
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // optional: 1 week
}
