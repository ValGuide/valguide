import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { adminSignInWithSlackFn } from '@/server/functions/admin-sign-in-with-slack.fn'

export const Route = createFileRoute('/_auth/login')({
  component: SlackLoginPage,
})

function SlackLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSlackLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await adminSignInWithSlackFn()
      if (result.error) {
        setError(result.error.message ?? 'Failed to sign in with Slack')
        setIsLoading(false)
        return
      }
      if (result.data?.url) {
        window.location.href = result.data.url
      }
    } catch {
      setError('Failed to initiate Slack login')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Sign in with your team Slack account</p>
        </div>

        {error && (
          <div className="w-full rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSlackLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          {isLoading ? 'Redirecting to Slack...' : 'Sign in with Slack'}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Only authorized team members can access the admin dashboard.
        </p>
      </div>
    </div>
  )
}
