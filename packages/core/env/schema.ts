import { z } from 'zod'

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  BETTER_AUTH_SECRET: z.string().min(1, 'Better Auth secret is required'),
  BETTER_AUTH_URL: z.string().optional().default(''),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional().default(''),
  BETTER_AUTH_COOKIE_DOMAIN: z.string().optional().default(''),
  BETTER_AUTH_COOKIE_PREFIX: z.string().optional().default('valguide-auth'),
  BETTER_AUTH_DEV_OTP: z.string().optional().default(''),
  DRIZZLE_LOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  RESEND_SENDING_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('ValGuide <noreply@valguide.com>'),
  VALBOT_SLACK_TOKEN: z.string().optional(),
  MAINTENANCE_SLACK_CHANNEL: z.string().min(1, 'Maintenance Slack channel is required'),
  USERS_SLACK_CHANNEL: z.string().min(1, 'Users Slack channel is required'),
  STUDIO_EVENTS_SLACK_CHANNEL: z.string().min(1, 'Studio events Slack channel is required'),
  STUDIO_FEEDBACK_SLACK_CHANNEL: z.string().min(1, 'Studio feedback Slack channel is required'),
  STUDIO_PERFORMANCE_LOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  ADMIN_BASE_URL: z.string().optional().default('https://ops.val.guide'),
  LINKS_BASE_URL: z.string().optional().default('https://links.valguide.com'),
  VITE_ENV: z.enum(['local', 'dev', 'prod']).optional().default('prod'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_BASE_URL: z.string().optional().default('https://app.valguide.com'),
  VITE_STUDIO_URL: z.string().optional().default('https://studio.valguide.com'),
  LINEAR_API_KEY: z.string().optional(),
  LINEAR_FEEDBACK_TEAM_ID: z.string().optional().default(''),
  LINEAR_FEEDBACK_LABEL_ID: z.string().optional().default(''),
})

export const clientEnvSchema = z.object({
  VITE_POSTHOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
  VITE_PRIVACY_POLICY_URL: z.string().optional().default('https://www.valguide.com/privacy-policy'),
  VITE_STUDIO_URL: z.string().optional(),
  VITE_TERMS_OF_SERVICE_URL: z.string().optional().default('https://www.valguide.com/terms-of-service'),
  VITE_APP_DOMAIN: z.string().optional().default('app.valguide.com'),
  VITE_IMAGEKIT_URL: z.string().optional().default('https://ik.imagekit.io/valguide'),
  VITE_ENV: z.enum(['local', 'dev', 'prod']).optional().default('prod'),
  VITE_STUDIO_SUPPORT_EMAIL: z.string().optional().default('support@valguide.com'),
  VITE_ASSET_BASE_URL: z.string().optional().default(''),
  VITE_R2_PUBLIC_URL: z.string().optional().default('https://assets.valguide.com'),
  VITE_IMAGE_DELIVERY_PROVIDER: z.enum(['cloudflare', 'imagekit', 'origin']).optional(),
  VITE_IMAGE_PROVIDER: z.enum(['cloudflare', 'imagekit']).optional().default('cloudflare'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
