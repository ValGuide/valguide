import { env } from 'cloudflare:workers'
import { robotsResponse } from '@valguide/core/features/seo/robots'

const COOKIE_NAME = 'sb-auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function loginPage(showError = false): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ValGuide Storybook</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      background:#fafafa;color:#09090b;
      min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;
    }
    .card{width:100%;max-width:360px}
    h1{font-size:1.25rem;font-weight:500;text-align:center;margin-bottom:.25rem}
    .sub{font-size:.875rem;color:#71717a;text-align:center;margin-bottom:2rem}
    form{display:flex;flex-direction:column;gap:.75rem}
    input{
      width:100%;padding:.5rem .75rem;
      background:#fff;border:1px solid #e4e4e7;border-radius:.5rem;
      color:#09090b;font-size:.875rem;outline:none;
    }
    input:focus{border-color:#a1a1aa;box-shadow:0 0 0 2px rgba(0,0,0,.06)}
    button{
      padding:.5rem 1rem;background:#09090b;color:#fafafa;
      border:none;border-radius:.5rem;font-size:.875rem;font-weight:500;cursor:pointer;
    }
    button:hover{background:#27272a}
    .error{font-size:.875rem;color:#dc2626}
  </style>
</head>
<body>
  <div class="card">
    <h1>ValGuide Storybook</h1>
    <p class="sub">Enter the password to access the component library.</p>
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Password" autofocus required />
      ${showError ? '<p class="error">Incorrect password.</p>' : ''}
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`
  return new Response(html, {
    status: showError ? 401 : 200,
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  })
}

async function makeToken(): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(env.STORYBOOK_PASSWORD),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('storybook-session'))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(env.STORYBOOK_PASSWORD),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0))
    return await crypto.subtle.verify('HMAC', key, tokenBytes, enc.encode('storybook-session'))
  } catch {
    return false
  }
}

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v ?? '')
  }
  return null
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/robots.txt') {
      return robotsResponse(env.BLOCK_ROBOTS === 'true')
    }

    if (request.method === 'POST' && url.pathname === '/login') {
      const form = await request.formData()
      const password = form.get('password')?.toString() ?? ''
      if (password !== env.STORYBOOK_PASSWORD) {
        return loginPage(true)
      }
      const token = await makeToken()
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
          'Set-Cookie': `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}; Path=/`,
        },
      })
    }

    const token = getCookie(request, COOKIE_NAME)
    if (token && (await verifyToken(token))) {
      if (env.DEV_PROXY) {
        const proxied = new URL(request.url)
        proxied.host = env.DEV_PROXY
        proxied.protocol = 'http:'
        return fetch(proxied.toString(), request)
      }
      if (!env.ASSETS) {
        return new Response('Static assets binding is not configured.', { status: 500 })
      }
      return env.ASSETS.fetch(request)
    }

    return loginPage()
  },
}
