import { type ClientEnv, clientEnvSchema } from './schema'

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
