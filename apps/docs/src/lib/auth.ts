import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const COOKIE_NAME = 'docs_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function getDocsPassword(): string {
  const password = process.env.DOCS_PASSWORD
  if (!password) {
    throw new Error('DOCS_PASSWORD environment variable is not set')
  }
  return password
}

export const checkAuthFn = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie(COOKIE_NAME)
  return { authenticated: token === getDocsPassword() }
})

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const correct = data.password === getDocsPassword()
    if (correct) {
      setCookie(COOKIE_NAME, data.password, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      })
    }
    return { success: correct }
  })
