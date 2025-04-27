import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@valguide/logger'

const logger = createLogger('supabase')

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase URL or key is missing. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export type SupabaseClient = typeof supabase
