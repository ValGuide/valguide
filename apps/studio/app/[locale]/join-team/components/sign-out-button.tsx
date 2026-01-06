
import { Button } from '@valguide/ui/components/button'
import { useState } from 'react'

type SignOutButtonProps = {
  children: React.ReactNode
  onSignOut: () => Promise<void>
}

export function SignOutButton({ children, onSignOut }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await onSignOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSignOut} disabled={loading}>
      {loading ? 'Signing out...' : children}
    </Button>
  )
}
