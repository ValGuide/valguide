import { createFileRoute, redirect } from '@tanstack/react-router'
import { notifyStudioBlockedAccessFn } from '@valguide/core/features/auth/notify-studio-blocked-access.fn'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { PendingApprovalContainer } from '@/features/auth/pending-approval-container'

export const Route = createFileRoute('/blocked')({
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await context.queryClient.ensureQueryData(isAuthenticatedQueryOptions())
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    // Invalidate cache to fetch fresh status (user may have accepted invite)
    await context.queryClient.invalidateQueries({ queryKey: ['user-status'] })
    const statusResult = await context.queryClient.ensureQueryData(userStatusQueryOptions())
    const status = statusResult?.status ?? 'pending'

    if (status === 'approved') {
      throw redirect({ to: '/tours' })
    }
    if (status === 'pending') {
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
