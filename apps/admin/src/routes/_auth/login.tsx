import { createFileRoute } from '@tanstack/react-router'
import { LockKeyhole } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { adminSignInWithPasswordFn } from '@/server/functions/admin-sign-in-with-password.fn'
import { adminSignInWithSlackFn } from '@/server/functions/admin-sign-in-with-slack.fn'
import { getAdminAuthOptionsFn } from '@/server/functions/get-admin-auth-options.fn'

export const Route = createFileRoute('/_auth/login')({
  loader: () => getAdminAuthOptionsFn(),
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const authOptions = Route.useLoaderData()
  const [isSlackLoading, setIsSlackLoading] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSlackLogin = async () => {
    setIsSlackLoading(true)
    setError(null)
    try {
      const result = await adminSignInWithSlackFn()
      if (result.error) {
        setError(result.error.message ?? 'Failed to sign in with Slack')
        setIsSlackLoading(false)
        return
      }
      if (result.data?.url) {
        window.location.href = result.data.url
      }
    } catch {
      setError('Failed to initiate Slack login')
      setIsSlackLoading(false)
    }
  }

  const handleCredentialsLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCredentialsLoading(true)
    setError(null)
    try {
      const result = await adminSignInWithPasswordFn({
        data: {
          email,
          password,
        },
      })
      if (result.error) {
        setError(result.error.message ?? 'Failed to sign in')
        setIsCredentialsLoading(false)
        return
      }
      window.location.href = result.data?.url ?? '/users'
    } catch {
      setError('Failed to sign in')
      setIsCredentialsLoading(false)
    }
  }

  const isLoading = isSlackLoading || isCredentialsLoading
  const showDivider = authOptions.credentialsEnabled && authOptions.slackEnabled
  const subtitle = authOptions.credentialsEnabled
    ? 'Sign in with your admin account'
    : authOptions.slackEnabled
      ? 'Sign in with your team Slack account'
      : 'Admin sign-in is not configured'

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {authOptions.configurationError && (
          <div className="w-full rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {authOptions.configurationError}
          </div>
        )}

        {error && (
          <div className="w-full rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {authOptions.credentialsEnabled && (
          <form onSubmit={handleCredentialsLogin} className="w-full space-y-3">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <LockKeyhole className="size-4" aria-hidden="true" />
              {isCredentialsLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {showDivider && (
          <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {authOptions.slackEnabled && (
          <button
            type="button"
            onClick={handleSlackLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Slack"
            >
              <path
                d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
                fill="#E01E5A"
              />
              <path
                d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
                fill="#36C5F0"
              />
              <path
                d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.527 2.527 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.527 2.527 0 0 1 2.523 2.522v6.312z"
                fill="#2EB67D"
              />
              <path
                d="M15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"
                fill="#ECB22E"
              />
            </svg>
            {isSlackLoading ? 'Redirecting to Slack...' : 'Sign in with Slack'}
          </button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Only authorized team members can access the admin dashboard.
        </p>
      </div>
    </div>
  )
}
