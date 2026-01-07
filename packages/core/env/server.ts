import { z } from 'zod'

const isTest = process.env.NODE_ENV === 'test'

const serverEnvSchema = z.object({
  VG_DATABASE_URL: isTest ? z.string().optional().default('') : z.string().min(1, 'Database URL is required'),
  VG_SUPABASE_URL: isTest
    ? z.string().optional().default('https://test.supabase.co')
    : z.string().url('Invalid Supabase URL'),
  VG_SUPABASE_PUBLISHABLE_KEY: isTest
    ? z.string().optional().default('test-key')
    : z.string().min(1, 'Supabase publishable key is required'),
  VG_SUPABASE_COOKIE_DOMAIN: z.string().optional(),
  VG_KV_REST_API_URL: z.string().optional(),
  VG_KV_REST_API_TOKEN: z.string().optional(),
  VG_DRIIZLE_LOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  VG_RESEND_SENDING_API_KEY: z.string().optional(),
  VG_EMAIL_FROM: z.string().optional().default('ValGuide <noreply@valguide.com>'),
  VALBOT_SLACK_TOKEN: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_BASE_URL: z.string().optional().default('https://app.valguide.com'),
  VITE_STUDIO_URL: z.string().optional().default('https://studio.valguide.com'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let _serverEnv: ServerEnv | null = null

export function getServerEnv(): ServerEnv {
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

export const serverEnv = new Proxy({} as ServerEnv, {
  get(_, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv]
  },
})
