import { createFileRoute, redirect } from '@tanstack/react-router'
import { ensureDefaultTeamFn } from '@valguide/core/features/orgs/ensure-default-team.fn'
import { protectedSessionBootstrapQueryOptions } from '@valguide/features/auth/query-options'
import { Spinner } from '@valguide/ui/components/spinner'

function SessionRecoveryPending() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  )
}

export const Route = createFileRoute('/session-recovery')({
  beforeLoad: async ({ context, location }) => {
    await context.queryClient.invalidateQueries({ queryKey: ['protected-session-bootstrap'] })
    const bootstrap = await context.queryClient.ensureQueryData(protectedSessionBootstrapQueryOptions())

    if (!bootstrap.user) {
      throw redirect({
        to: '/login',
        search: { next: location.href },
      })
    }

    if (bootstrap.status === 'pending') {
      throw redirect({ to: '/pending' })
    }

    if (bootstrap.status === 'blocked') {
      throw redirect({ to: '/blocked' })
    }

    if (bootstrap.activeOrgId) {
      throw redirect({ to: '/tours' })
    }

    const ensuredTeam = await ensureDefaultTeamFn()

    context.queryClient.setQueryData(protectedSessionBootstrapQueryOptions().queryKey, {
      user: bootstrap.user,
      status: bootstrap.status,
      activeOrgId: ensuredTeam.teamId,
      activeOrgSource: 'resolved',
    })

    await context.queryClient.invalidateQueries({ queryKey: ['sidebar'] })

    throw redirect({ to: '/tours' })
  },
  component: SessionRecoveryPending,
  pendingComponent: SessionRecoveryPending,
})
