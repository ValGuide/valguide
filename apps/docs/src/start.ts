import { createMiddleware, createStart } from '@tanstack/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'

const COOKIE_NAME = 'docs_auth'

function getDocsPassword(): string {
  const password = process.env.DOCS_PASSWORD
  if (!password) {
    throw new Error('DOCS_PASSWORD environment variable is not set')
  }
  return password
}

const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest()
  const url = new URL(request.url)

  const publicPaths = ['/login', '/_server']
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return next()
  }

  const token = getCookie(COOKIE_NAME)
  if (token !== getDocsPassword()) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login' },
    })
  }

  return next()
})

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [authMiddleware],
  }
})
