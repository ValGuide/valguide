import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { BlockedPage } from '@valguide/core/features/auth/common/blocked-page'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'

export const Route = createFileRoute('/blocked')({
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
    if (status === 'pending') {
      throw redirect({ to: '/pending' })
    }
  },
  component: BlockedPageRoute,
})

function BlockedPageRoute() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await signOutFn({ data: {} })
    queryClient.clear()
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  return <BlockedPage onSignOut={handleSignOut} />
}
