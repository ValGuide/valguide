import { env } from 'cloudflare:workers'
import { createMiddleware } from '@tanstack/react-start'

const AUTH_COOKIE = 'vg_docs_auth'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const PUBLIC_PATHS = new Set(['/login', '/robots.txt', '/favicon.ico'])

type AssetsBinding = {
  fetch(request: Request): Promise<Response>
}

export const docsPasswordAuthMiddleware = createMiddleware({ type: 'request' }).server(async ({ next, request }) => {
  const password = process.env.DOCS_PASSWORD
  if (!password) return next()

  const url = new URL(request.url)
  if (PUBLIC_PATHS.has(url.pathname)) {
    if (url.pathname === '/login' && request.method === 'POST') {
      return handleLoginPost(request, password)
    }
    if (url.pathname === '/login' && request.method === 'GET') {
      return renderLoginPage(url, false)
    }
    return next()
  }

  if (!(await hasValidSession(request, password))) {
    return redirectToLogin(url)
  }

  if (url.pathname.startsWith('/assets/')) {
    const assets = (env as { ASSETS?: AssetsBinding }).ASSETS
    if (!assets) {
      return new Response('Static assets binding is not configured.', { status: 500 })
    }
    return assets.fetch(request)
  }

  return next()
})

async function handleLoginPost(request: Request, password: string) {
  const formData = await request.formData()
  const submittedPassword = String(formData.get('password') ?? '')
  const nextPath = sanitizeNextPath(String(formData.get('next') ?? '/'))

  if (submittedPassword !== password) {
    const url = new URL(request.url)
    url.searchParams.set('next', nextPath)
    return renderLoginPage(url, true)
  }

  return new Response(null, {
    status: 303,
    headers: {
      location: nextPath,
      'set-cookie': `${AUTH_COOKIE}=${await sessionToken(password)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
      'cache-control': 'no-store',
    },
  })
}

function redirectToLogin(url: URL) {
  const loginUrl = new URL('/login', url)
  loginUrl.searchParams.set('next', `${url.pathname}${url.search}`)

  return new Response(null, {
    status: 302,
    headers: {
      location: `${loginUrl.pathname}${loginUrl.search}`,
      'cache-control': 'no-store',
    },
  })
}

function renderLoginPage(url: URL, hasError: boolean) {
  const nextPath = sanitizeNextPath(url.searchParams.get('next') ?? '/')
  const errorMarkup = hasError ? '<p class="error">Incorrect password.</p>' : ''

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ValGuide Docs Login</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #111;
        color: #f5f5f5;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { width: min(100% - 32px, 360px); }
      h1 { margin: 0 0 8px; font-size: 24px; line-height: 1.2; }
      p { margin: 0 0 24px; color: #a3a3a3; }
      label {
        display: block;
        margin-bottom: 8px;
        color: #d4d4d4;
        font-size: 14px;
        font-weight: 600;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        height: 42px;
        border: 1px solid #3f3f46;
        border-radius: 6px;
        padding: 0 12px;
        background: #18181b;
        color: #fff;
        font: inherit;
      }
      button {
        width: 100%;
        height: 42px;
        margin-top: 16px;
        border: 0;
        border-radius: 6px;
        background: #f5f5f5;
        color: #111;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .error { margin: 12px 0 0; color: #fca5a5; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <h1>ValGuide Docs</h1>
      <p>Enter the workspace docs password.</p>
      <form method="post" action="/login">
        <input type="hidden" name="next" value="${escapeHtml(nextPath)}" />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" autofocus />
        ${errorMarkup}
        <button type="submit">Continue</button>
      </form>
    </main>
  </body>
</html>`,
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    },
  )
}

async function hasValidSession(request: Request, password: string) {
  const cookies = parseCookies(request.headers.get('cookie') ?? '')
  const actual = cookies[AUTH_COOKIE]
  if (!actual) return false
  return constantTimeEqual(actual, await sessionToken(password))
}

function parseCookies(header: string) {
  const cookies: Record<string, string> = {}
  for (const part of header.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=')
    if (!rawKey || rawValue.length === 0) continue
    cookies[rawKey] = rawValue.join('=')
  }
  return cookies
}

async function sessionToken(password: string) {
  const input = new TextEncoder().encode(`valguide-docs:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

function sanitizeNextPath(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
