import { createFileRoute, redirect } from '@tanstack/react-router'
import { isAuthenticatedQueryOptions } from '@valguide/features/auth/query-options'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await context.queryClient.ensureQueryData(isAuthenticatedQueryOptions())
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    throw redirect({ to: '/tours' })
  },
})
