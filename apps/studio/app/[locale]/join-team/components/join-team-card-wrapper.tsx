'use client'

import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/actions'
import { useRouter } from '@valguide/i18n/routing'
import { JoinTeamCard } from './join-team-card'

type JoinTeamCardWrapperProps = {
  variant: 'wrong-account'
  invite: {
    organization: { name: string }
    email: string
  }
  userEmail: string
}

export function JoinTeamCardWrapper({ variant, invite, userEmail }: JoinTeamCardWrapperProps) {
  const router = useRouter()
  const signOut = useServerFn(signOutFn)

  const handleSignOut = async () => {
    await signOut({ data: { scope: 'global' } })
    router.refresh()
  }

  return <JoinTeamCard variant={variant} invite={invite} userEmail={userEmail} onSignOut={handleSignOut} />
}
