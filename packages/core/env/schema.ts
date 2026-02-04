import { z } from 'zod'

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_PUBLISHABLE_KEY: z.string({
    required_error: 'Supabase publishable key is required',
  }),
  SUPABASE_SECRET_KEY: z.string().optional(),
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

export const clientEnvSchema = z.object({
  VITE_POSTHOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
  VITE_STUDIO_URL: z.string().optional(),
  VITE_APP_DOMAIN: z.string().optional().default('app.valguide.com'),
  VITE_IMAGEKIT_URL: z.string().optional().default('https://ik.imagekit.io/valguide'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
