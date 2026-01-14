import { getCookie, setCookie } from '@tanstack/react-start/server'
import { serverEnv } from '../../env/server'

// DEPRECATED - keep for migration, remove after rollout
export function getActiveTeamSlug(): string | undefined {
  return getCookie('active-team-slug')
}

export function setActiveTeamSlug(slug: string): void {
  setCookie('active-team-slug', slug, {
    path: '/',
    httpOnly: true,
    secure: serverEnv.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

// NEW - use team ID (stable, doesn't change)
export function getActiveTeamId(): string | undefined {
  return getCookie('active-team-id')
}

export function setActiveTeamId(teamId: string): void {
  setCookie('active-team-id', teamId, {
    path: '/',
    httpOnly: true,
    secure: serverEnv.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}
