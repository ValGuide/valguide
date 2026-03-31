import { serverEnv } from '../../env/server'

export function resolveStudioBaseUrl(): string {
  return serverEnv.VITE_STUDIO_URL.replace(/\/$/, '')
}

export function resolveStudioSettingsUrl(): string {
  return `${resolveStudioBaseUrl()}/settings`
}

export function resolveStudioTourEditUrl(tourNanoId: string): string {
  return `${resolveStudioBaseUrl()}/tours/${tourNanoId}/edit`
}
