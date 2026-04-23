import { serverEnv } from '../../env/server'

export function resolveAdminBaseUrl(): string {
  const isDevEnv = serverEnv.VITE_ENV === 'dev' || serverEnv.VITE_ENV === 'local'
  const fallback = isDevEnv ? 'https://admin-dev.example.com' : 'https://admin.example.com'
  return (serverEnv.ADMIN_BASE_URL || fallback).replace(/\/$/, '')
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
