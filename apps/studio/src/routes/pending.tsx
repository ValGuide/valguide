import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { PendingApprovalPage } from '@valguide/core/features/auth/common/pending-approval-page'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { useEffect } from 'react'

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
  component: PendingPage,
})

function PendingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: statusResult, isRefetching } = useQuery({
    ...userStatusQueryOptions(),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const status = statusResult?.status
    if (status === 'approved') {
      router.navigate({ to: '/tours' })
    } else if (status === 'blocked') {
      router.navigate({ to: '/blocked' })
    }
  }, [statusResult?.status, router])

  const handleSignOut = async () => {
    await signOutFn({ data: {} })
    queryClient.clear()
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  const handleCheckAgain = async () => {
    await queryClient.invalidateQueries({ queryKey: ['user-status'] })
  }

  return <PendingApprovalPage onSignOut={handleSignOut} onCheckAgain={handleCheckAgain} isChecking={isRefetching} />
}
