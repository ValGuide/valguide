import { createFileRoute, redirect } from '@tanstack/react-router'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { PendingApprovalContainer } from '@/features/auth/pending-approval-container'

export const Route = createFileRoute('/pending')({
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await context.queryClient.ensureQueryData(isAuthenticatedQueryOptions())
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const statusResult = await context.queryClient.ensureQueryData(userStatusQueryOptions())
    const status = statusResult?.status ?? 'pending'

    if (status === 'approved') {
      throw redirect({ to: '/tours' })
    }
    if (status === 'blocked') {
      throw redirect({ to: '/blocked' })
    }
  },
  component: () => <PendingApprovalContainer />,
})
