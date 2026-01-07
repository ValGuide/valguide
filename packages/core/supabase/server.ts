import { createServerClient } from '@supabase/ssr'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { serverEnv } from '../env/server'
import { cookieOptions } from './cookies'

export async function createClient() {
  return createServerClient(serverEnv.VG_SUPABASE_URL, serverEnv.VG_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookies) {
        cookies.forEach((cookie) => {
          setCookie(cookie.name, cookie.value)
        })
      },
    },
    cookieOptions,
  })
}
