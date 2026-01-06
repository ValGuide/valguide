import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'

type CookieOptions = {
  path?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
  maxAge?: number
}

function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  return Object.fromEntries(
    (cookieHeader ?? '')
      .split('; ')
      .filter(Boolean)
      .map((c) => {
        const [key, ...rest] = c.split('=')
        return [key, decodeURIComponent(rest.join('='))]
      }),
  )
}

export function getCookie(name: string): string | undefined {
  const cookieHeader = getRequestHeader('cookie')
  const cookies = parseCookies(cookieHeader)
  return cookies[name]
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    path = '/',
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'Lax',
    maxAge,
  } = options

  let cookie = `${name}=${encodeURIComponent(value)}`
  cookie += `; Path=${path}`
  if (httpOnly) cookie += '; HttpOnly'
  if (secure) cookie += '; Secure'
  cookie += `; SameSite=${sameSite}`
  if (maxAge !== undefined) cookie += `; Max-Age=${maxAge}`

  setResponseHeader('Set-Cookie', cookie)
}

export function getActiveTeamSlug(): string | undefined {
  return getCookie('active-team-slug')
}

export function setActiveTeamSlug(slug: string): void {
  setCookie('active-team-slug', slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}
