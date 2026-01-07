import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_PUBLISHABLE_KEY: z.string({
    required_error: 'Supabase publishable key is required'
  }),
  SUPABASE_COOKIE_DOMAIN: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  DRIIZLE_LOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  RESEND_SENDING_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('ValGuide <noreply@valguide.com>'),
  VALBOT_SLACK_TOKEN: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_BASE_URL: z.string().optional().default('https://app.valguide.com'),
  VITE_STUDIO_URL: z.string().optional().default('https://studio.valguide.com'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let _serverEnv: ServerEnv | null = null

function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv

  const parsed = serverEnvSchema.safeParse(process.env)


  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }

  _serverEnv = parsed.data
  return _serverEnv
}

export const serverEnv = getServerEnv()
