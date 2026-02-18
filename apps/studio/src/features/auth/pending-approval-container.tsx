import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { PendingApprovalPage } from '@valguide/core/features/auth/common/pending-approval-page'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { useEffect } from 'react'

interface PendingApprovalContainerProps {
  /** Called once on mount (e.g. to notify team about blocked access) */
  onMount?: () => void
}

export function PendingApprovalContainer({ onMount }: PendingApprovalContainerProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    onMount?.()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once

  const { data: statusResult, isRefetching } = useQuery({
    ...userStatusQueryOptions(),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const status = statusResult?.status
    if (status === 'approved') {
      router.navigate({ to: '/tours' })
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

  return (
    <PendingApprovalPage
      onSignOut={handleSignOut}
      onCheckAgain={handleCheckAgain}
      isChecking={isRefetching}
      supportEmail={clientEnv.VITE_STUDIO_SUPPORT_EMAIL}
      userEmail={statusResult?.email ?? ''}
    />
  )
}
