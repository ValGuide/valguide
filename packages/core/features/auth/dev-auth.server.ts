import { createClient } from '@supabase/supabase-js'
import { serverEnv } from '../../env/server'

const DEV_TEST_EMAIL = 'e2e@valguide.test'

export type DevAuthResult = {
  magicLink: string
  email: string
}

export async function generateDevMagicLink(email = DEV_TEST_EMAIL): Promise<DevAuthResult> {
  if (serverEnv.NODE_ENV !== 'development') {
    throw new Error('Dev auth is only available in development mode')
  }

  if (!serverEnv.SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_SECRET_KEY is required for dev auth')
  }

  const adminClient = createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  await adminClient.auth.admin
    .createUser({
      email,
      email_confirm: true,
    })
    .catch(() => {
      // Ignore if user already exists
    })

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (error) {
    throw new Error(`Failed to generate magic link: ${error.message}`)
  }

  if (!data.properties.action_link) {
    throw new Error('No action link returned from Supabase')
  }

  return {
    magicLink: data.properties.action_link,
    email,
  }
}
