'use client'

import { signOutAction } from '@valguide/core/features/auth/actions'
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

  const handleSignOut = async () => {
    await signOutAction({ scope: 'global' })
    router.refresh()
  }

  return <JoinTeamCard variant={variant} invite={invite} userEmail={userEmail} onSignOut={handleSignOut} />
}
