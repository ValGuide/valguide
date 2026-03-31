import { serverEnv } from '../../env/server'

export function resolveAdminBaseUrl(): string {
  const isDevEnv = serverEnv.VITE_ENV === 'dev' || serverEnv.VITE_ENV === 'local'
  return (serverEnv.ADMIN_BASE_URL || (isDevEnv ? 'https://ops-dev.val.guide' : 'https://ops.val.guide')).replace(
    /\/$/,
    '',
  )
}

export function resolveAdminUsersUrl(): string {
  return `${resolveAdminBaseUrl()}/users`
}

export function resolveAdminOrgUrl(orgNanoId: string): string {
  return `${resolveAdminBaseUrl()}/orgs/${orgNanoId}`
}

export function resolveAdminMaintenanceUrl(): string {
  return `${resolveAdminBaseUrl()}/maintenance`
}
