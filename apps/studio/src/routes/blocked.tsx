import { createFileRoute, redirect } from '@tanstack/react-router'
import { notifyStudioBlockedAccessFn } from '@valguide/core/features/auth/notify-studio-blocked-access.fn'
import { protectedSessionBootstrapQueryOptions } from '@valguide/features/auth/query-options'
import { PendingApprovalContainer } from '@/features/auth/pending-approval-container'

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
  const notifyTeam = () => {
    const sessionKey = 'vg_blocked_notified_session'
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1')
      notifyStudioBlockedAccessFn({ data: {} })
    }
  }

  return <PendingApprovalContainer onMount={notifyTeam} />
}
