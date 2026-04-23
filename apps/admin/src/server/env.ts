import { serverEnvSchema } from '@valguide/core/env/schema'
import { z } from 'zod'

const adminEnvSchema = serverEnvSchema.extend({
  ADMIN_ALLOWED_EMAILS: z
    .string()
    .optional()
    .default('admin@valguide.com'),
  ADMIN_COOKIE_DOMAIN: z.string().optional().default('val.guide'),
  ADMIN_BASE_URL: z.string().optional().default('https://ops.val.guide'),
  SLACK_CLIENT_ID: z.string().optional().default(''),
  SLACK_CLIENT_SECRET: z.string().optional().default(''),
  SLACK_TEAM_ID: z.string().optional().default(''),
})

export type AdminEnv = z.infer<typeof adminEnvSchema>

let _adminEnv: AdminEnv | null = null

function getAdminEnv(): AdminEnv {
  if (_adminEnv) return _adminEnv

  const parsed = adminEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid admin environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid admin environment variables')
  }

  _adminEnv = parsed.data
  return _adminEnv
}

export const adminEnv: AdminEnv = new Proxy({} as AdminEnv, {
  get(_, prop: string) {
    return getAdminEnv()[prop as keyof AdminEnv]
  },
})
