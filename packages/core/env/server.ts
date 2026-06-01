import { env as cloudflareEnv } from 'cloudflare:workers'
import { type ServerEnv, serverEnvSchema } from './schema'

let _serverEnv: ServerEnv | null = null

function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv

  const parsed = serverEnvSchema.safeParse({
    ...toStringEnv(cloudflareEnv),
    ...process.env,
  })

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }

  _serverEnv = parsed.data
  return _serverEnv
}

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv]
  },
})

function toStringEnv(env: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') {
      result[key] = value
    }
  }

  return result
}
