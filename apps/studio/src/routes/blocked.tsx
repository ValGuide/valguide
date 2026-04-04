import { createFileRoute, redirect } from '@tanstack/react-router'
import { protectedSessionBootstrapQueryOptions } from '@valguide/features/auth/query-options'
import { AccountStatusContainer } from '@/features/auth/account-status-container'

export const Route = createFileRoute('/blocked')({
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

    if (bootstrap.status === 'pending') {
      throw redirect({ to: '/pending' })
    }
  },
  component: BlockedPageRoute,
})

function BlockedPageRoute() {
  return <AccountStatusContainer notifyBlockedAccess />
}
