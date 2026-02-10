import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { loginFn } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.authenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const result = await loginFn({ data: { password } })

    if (result.success) {
      await router.invalidate()
      router.navigate({ to: '/' })
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-medium text-center mb-1">ValGuide Docs</h1>
        <p className="text-sm text-fd-muted-foreground text-center mb-8">Enter the password to access documentation.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring"
          />
          {error && <p className="text-sm text-red-500">Incorrect password.</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
