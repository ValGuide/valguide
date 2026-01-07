import { z } from 'zod'

const isTest = process.env.NODE_ENV === 'test'

const envSchema = z.object({
  RESEND_SENDING_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('ValGuide <noreply@valguide.com>'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let _env: Env | null = null

export function getEnv(): Env {
  if (_env) return _env

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }

  _env = parsed.data
  return _env
}

export const env = getEnv()
