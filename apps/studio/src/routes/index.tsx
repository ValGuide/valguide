import { createFileRoute, redirect } from '@tanstack/react-router'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await context.queryClient.ensureQueryData(isAuthenticatedQueryOptions())
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const statusResult = await context.queryClient.ensureQueryData(userStatusQueryOptions())
    const status = statusResult?.status ?? 'pending'
    if (status === 'pending') {
      throw redirect({ to: '/pending' })
    }
    if (status === 'blocked') {
      throw redirect({ to: '/blocked' })
    }

    throw redirect({ to: '/tours' })
  },
})
