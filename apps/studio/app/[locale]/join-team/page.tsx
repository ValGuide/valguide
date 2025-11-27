import { createHash } from 'crypto'
import { createClient } from '@valguide/core/supabase/server'
import { joinTeamAction } from '@valguide/core/features/orgs/actions'
import { getInvitationByTokenHash } from '@valguide/core/features/orgs/queries'
import { db } from '@valguide/core/features/db'
import { redirect } from 'next/navigation'
import { JoinTeamCard } from './components/join-team-card'

export default async function JoinTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token: string }>
}) {
  const { locale } = await params
  const { token } = await searchParams

  if (!token) {
    redirect(`/${locale}`)
  }

  // 1. Fetch invitation details (publicly available via token)
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const invite = await getInvitationByTokenHash(db, tokenHash)

  // Handle invalid/expired invitation
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <JoinTeamCard variant="invalid" />
      </div>
    )
  }

  // 2. Check authentication
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const nextUrl = `/${locale}/join-team?token=${token}`

  // 3. Case: User is NOT logged in -> Public Landing Page
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <JoinTeamCard 
          variant="public" 
          invite={invite} 
          nextUrl={nextUrl}
        />
      </div>
    )
  }

  // 4. Case: User IS logged in but EMAIL MISMATCH
  const userEmail = user.email || ''
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <JoinTeamCard 
          variant="wrong-account" 
          invite={invite}
          userEmail={userEmail}
        />
      </div>
    )
  }

  // 5. Case: User logged in & Email matches -> Attempt to Join
  let error: string | null = null

  try {
    const result = await joinTeamAction(token)
    if (result.success) {
      redirect(`/${locale}`)
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to join team'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <JoinTeamCard 
        variant="joining" 
        invite={invite}
        error={error}
      />
    </div>
  )
}
