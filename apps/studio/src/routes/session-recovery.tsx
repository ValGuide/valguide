import { createFileRoute, redirect } from '@tanstack/react-router'
import { ensureDefaultTeamFn } from '@valguide/core/features/orgs/ensure-default-team.fn'
import { protectedSessionBootstrapQueryOptions } from '@valguide/features/auth/query-options'
import { DefaultPending } from '@/components/default-pending'

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

    await ensureDefaultTeamFn()

    await Promise.all([
      context.queryClient.invalidateQueries({ queryKey: ['protected-session-bootstrap'] }),
      context.queryClient.invalidateQueries({ queryKey: ['sidebar'] }),
    ])

    throw redirect({ to: '/tours' })
  },
  component: DefaultPending,
  pendingComponent: DefaultPending,
})
