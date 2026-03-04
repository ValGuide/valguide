import { serverEnv } from '../../env/server'

export function resolveUsersSlackChannel(): string {
  const isDevEnv = serverEnv.VITE_ENV === 'dev' || serverEnv.VITE_ENV === 'local'
  return serverEnv.USERS_SLACK_CHANNEL || (isDevEnv ? 'users-dev' : 'users')
}
