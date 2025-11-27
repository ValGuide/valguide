'use client'

import { useState } from 'react'
import { signOutAction } from '@valguide/core/features/auth/actions'
import { useRouter } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'

export function SignOutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await signOutAction({ scope: 'global' })
      router.refresh()
    } catch (error) {
      console.error('Failed to sign out:', error)
      // Even if it fails, we try to refresh to update state
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? 'Signing out...' : children}
    </Button>
  )
}
