import { z } from 'zod'

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_PUBLISHABLE_KEY: z.string({
    required_error: 'Supabase publishable key is required',
  }),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_COOKIE_DOMAIN: z.string().optional(),
  DRIZZLE_LOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  RESEND_SENDING_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('ValGuide <noreply@valguide.com>'),
  VALBOT_SLACK_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_BASE_URL: z.string().optional().default('https://app.valguide.com'),
  VITE_STUDIO_URL: z.string().optional().default('https://studio.valguide.com'),
  ADMIN_ALLOWED_EMAILS: z
    .string()
    .optional()
    .default('curator@museum-zurich.example,curator@museum-zurich.example,ops@museum-zurich.example'),
  ADMIN_COOKIE_DOMAIN: z.string().optional(),
  ADMIN_BASE_URL: z.string().optional().default('https://admin-local.dev'),
  SLACK_TEAM_ID: z.string().optional(),
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
  VITE_ENV: z.enum(['local', 'dev', 'prod']).optional().default('prod'),
  VITE_STUDIO_SUPPORT_EMAIL: z.string().optional().default('support@valguide.com'),
  VITE_R2_PUBLIC_URL: z.string().optional().default('https://assets.valguide.app'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
