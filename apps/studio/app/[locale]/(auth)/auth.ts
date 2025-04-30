import { supabase } from '@/utils/supabase'
import { Session } from '@supabase/supabase-js'

export async function auth(): Promise<{ user?: { email?: string } } | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    return {
      user: {
        email: session.user?.email,
      },
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}
