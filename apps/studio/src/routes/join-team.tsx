import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Consent } from '@valguide/core/features/auth/common/consent'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { getInvitationDataFn } from '@valguide/core/features/orgs/get-invitation-data.fn'
import { joinTeamFn } from '@valguide/core/features/orgs/join-team.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { JoinTeamCard } from '../features/join-team/components/join-team-card'

const searchSchema = z.object({
  invitationId: z.string().optional(),
})

export const Route = createFileRoute('/join-team')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ invitationId: search.invitationId }),
  loader: async ({ deps }) => {
    return getInvitationDataFn({ data: { invitationId: deps.invitationId } })
  },
  component: JoinTeamPage,
})

function JoinTeamPage() {
  const data = Route.useLoaderData()
  const { invitationId } = Route.useSearch()
  const queryClient = useQueryClient()
  const router = useRouter()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const joinTeam = useServerFn(joinTeamFn)
  const signOut = useServerFn(signOutFn)

  // Auto-join when already authenticated with correct email
  useEffect(() => {
    if (data.variant === 'joining' && invitationId && !isJoining && !error) {
      setIsJoining(true)
      joinTeam({ data: { invitationId } })
        .then(async (result) => {
          if (result.success) {
            await queryClient.invalidateQueries({
              queryKey: ['user-status'],
            })
            await queryClient.invalidateQueries({
              queryKey: ['is-authenticated'],
            })
            navigate({ to: '/' })
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to join team')
        })
    }
  }, [data.variant, invitationId, joinTeam, isJoining, error, queryClient, navigate])

  const handleSignOut = async () => {
    await signOut({ data: { scope: 'global' } })
    router.invalidate()
  }

  const loginNext = invitationId ? `/join-team?invitationId=${encodeURIComponent(invitationId)}` : '/join-team'

  return (
    <main className="min-h-svh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]',
          'from-background via-muted to-muted',
          'dark:from-muted/50 dark:via-background dark:to-background',
        )}
      />
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpath fill='none' stroke='%23000' stroke-width='0.5' d='M0 50 Q50 20 100 50 T200 50 M0 100 Q50 70 100 100 T200 100 M0 150 Q50 120 100 150 T200 150'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      <div className="relative w-full max-w-md">
        <JoinTeamCard
          className={cn('shadow-xl shadow-black/5 dark:shadow-black/20', 'border border-border/50', 'rounded-2xl')}
          variant={data.variant}
          invite={data.invite}
          userEmail={data.userEmail}
          error={error}
          loginNext={data.variant === 'public' ? loginNext : undefined}
          onSignOut={data.variant === 'wrong-account' ? handleSignOut : undefined}
        />
      </div>
      <div className="relative mt-6 w-full max-w-md text-center">
        <JoinTeamFooter variant={data.variant} onSignOut={handleSignOut} />
      </div>
    </main>
  )
}

function JoinTeamFooter({ variant, onSignOut }: { variant: string; onSignOut: () => Promise<void> }) {
  const t = useTranslations('joinTeam')

  // Unauthenticated states show consent/terms
  if (variant === 'invalid' || variant === 'public') {
    return <Consent />
  }

  // Authenticated states show sign-out link
  return (
    <Button variant="link" size="sm" onClick={onSignOut} className="text-xs text-muted-foreground">
      {t('accepted.signOutFooter')}
    </Button>
  )
}
