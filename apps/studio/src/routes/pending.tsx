import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { PendingApprovalPage } from '@valguide/core/features/auth/common/pending-approval-page'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { useState } from 'react'

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
  const [isChecking, setIsChecking] = useState(false)

  const handleSignOut = async () => {
    await signOutFn({ data: {} })
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  const handleCheckAgain = async () => {
    setIsChecking(true)
    await queryClient.invalidateQueries({ queryKey: ['user-status'] })
    await queryClient.refetchQueries({ queryKey: ['user-status'] })
    setIsChecking(false)
    await router.invalidate()
  }

  return <PendingApprovalPage onSignOut={handleSignOut} onCheckAgain={handleCheckAgain} isChecking={isChecking} />
}
