import { getCookie, getResponseHeaders, setCookie } from '@tanstack/react-start/server'
import { serverEnv } from '../../env/server'

/**
 * During SSR, getCookie reads from the incoming request headers.
 * If setActiveTeamId was called earlier in the same SSR pass, the cookie
 * exists only on the response (Set-Cookie header), not on the request.
 * Fall back to parsing the response's Set-Cookie headers.
 */
export function getActiveTeamId(): string | undefined {
  const fromRequest = getCookie('active-team-id')
  if (fromRequest) return fromRequest

  try {
    const headers = getResponseHeaders()
    const setCookieValues = headers.getSetCookie?.() ?? []
    for (const cookieStr of setCookieValues) {
      const match = cookieStr.match(/^active-team-id=([^;]+)/)
      if (match) return match[1]
    }
  } catch {
    // Not in a server context
  }

  return undefined
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
