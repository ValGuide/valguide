import { z } from 'zod'

const clientEnvSchema = z.object({
  VITE_POSTHOG_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
  VITE_STUDIO_URL: z.string().optional(),
  VITE_APP_DOMAIN: z.string().optional(),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>

let _clientEnv: ClientEnv | null = null

function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv

  const parsed = clientEnvSchema.safeParse(import.meta.env)

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid client environment variables')
  }

  _clientEnv = parsed.data
  return _clientEnv
}

export const clientEnv = getClientEnv()
