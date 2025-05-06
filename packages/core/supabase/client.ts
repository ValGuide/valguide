import { createBrowserClient } from '@supabase/ssr'
import { cookieOptions } from '@valguide/supabase/cookies'

export function createClient() {
  console.info(cookieOptions)
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
