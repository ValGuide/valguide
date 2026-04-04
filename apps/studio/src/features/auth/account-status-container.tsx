import { useQuery, useQueryClient } from '@tanstack/react-query'
import { clientEnv } from '@valguide/core/env/client'
import {
  AccountStatusPage,
  type AccountStatusPageVariant,
} from '@valguide/core/features/auth/common/account-status-page'
import { notifyStudioBlockedAccessFn } from '@valguide/core/features/auth/notify-studio-blocked-access.fn'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { useEffect } from 'react'

interface AccountStatusContainerProps {
  notifyBlockedAccess?: boolean
}

export function AccountStatusContainer({ notifyBlockedAccess = false }: AccountStatusContainerProps) {
  const queryClient = useQueryClient()

  const { data: statusResult, isRefetching } = useQuery({
    ...userStatusQueryOptions(),
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 30_000 : false),
  })

  useEffect(() => {
    if (!notifyBlockedAccess || statusResult?.status !== 'blocked') {
      return
    }

    const sessionKey = 'vg_blocked_notified_session'
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1')
      notifyStudioBlockedAccessFn({ data: {} })
    }
  }, [notifyBlockedAccess, statusResult?.status])

  useEffect(() => {
    const status = statusResult?.status
    if (status === 'approved') {
      window.location.href = '/tours'
    }
  }, [statusResult?.status])

  const handleSignOut = async () => {
    await signOutFn({ data: {} })
    queryClient.clear()
    window.location.href = '/login'
  }

  const handleCheckAgain = async () => {
    window.location.href = '/pending'
  }

  const status: AccountStatusPageVariant =
    statusResult?.status === 'blocked' || statusResult?.status === 'deactivated' ? statusResult.status : 'pending'

  return (
    <AccountStatusPage
      variant={status}
      onSignOut={handleSignOut}
      onCheckAgain={status === 'pending' ? handleCheckAgain : undefined}
      isChecking={isRefetching}
      supportEmail={clientEnv.VITE_STUDIO_SUPPORT_EMAIL}
      userEmail={statusResult?.email ?? ''}
    />
  )
}
