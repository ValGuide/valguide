import { serverEnv } from '../../env/server'

export function isLocalRuntime(): boolean {
  return serverEnv.VITE_ENV === 'local'
}
