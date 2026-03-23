import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
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
  const signOut = useServerFn(signOutFn)

  const handleSignOut = async () => {
    await signOut({ data: { scope: 'global' } })
    window.location.href = '/login'
  }

  return <JoinTeamCard variant={variant} invite={invite} userEmail={userEmail} onSignOut={handleSignOut} />
}
