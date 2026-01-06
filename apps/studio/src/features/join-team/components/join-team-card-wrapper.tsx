import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/server-functions'
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
    router.invalidate()
  }

  return <JoinTeamCard variant={variant} invite={invite} userEmail={userEmail} onSignOut={handleSignOut} />
}
