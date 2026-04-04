import { createFileRoute, redirect } from '@tanstack/react-router'
import { protectedSessionBootstrapQueryOptions } from '@valguide/features/auth/query-options'
import { AccountStatusContainer } from '@/features/auth/account-status-container'

export const Route = createFileRoute('/pending')({
  beforeLoad: async ({ context, location }) => {
    await context.queryClient.invalidateQueries({ queryKey: ['protected-session-bootstrap'] })
    const bootstrap = await context.queryClient.ensureQueryData(protectedSessionBootstrapQueryOptions())

    if (!bootstrap.user) {
      throw redirect({ to: '/login' })
    }

    if (bootstrap.status === 'approved') {
      throw redirect({
        to: bootstrap.activeOrgId ? '/tours' : '/session-recovery',
        search: bootstrap.activeOrgId ? undefined : { next: location.href },
      })
    }

    if (bootstrap.status === 'blocked' || bootstrap.status === 'deactivated') {
      throw redirect({ to: '/blocked' })
    }
  },
  component: () => <AccountStatusContainer />,
})
