import type { CookieOptionsWithName } from '@supabase/ssr'
import { serverEnv } from '../env/server'

export const cookieOptions = (): CookieOptionsWithName => ({
  name: 'sb-auth-token',
  domain: serverEnv.SUPABASE_COOKIE_DOMAIN,
  path: '/',
  sameSite: 'lax',
  secure: true,
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 1 week (notice: doesn't seem to work)
})
