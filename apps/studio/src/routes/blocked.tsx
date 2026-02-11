import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { BlockedPage } from '@valguide/core/features/auth/common/blocked-page'
import { notifyStudioBlockedAccessFn } from '@valguide/core/features/auth/notify-studio-blocked-access.fn'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { isAuthenticatedQueryOptions, userStatusQueryOptions } from '@valguide/features/auth/query-options'
import { useEffect, useState } from 'react'

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
  const router = useRouter()
  const queryClient = useQueryClient()

  // Notify team once per session only
  useEffect(() => {
    const sessionKey = 'vg_blocked_notified_session'
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1')
      notifyStudioBlockedAccessFn({ data: {} })
    }
  }, [])

  // Check status and redirect if changed
  const handleCheckStatus = async () => {
    try {
      // Invalidate cache to fetch fresh status
      await queryClient.invalidateQueries({ queryKey: ['user-status'] })
      const statusResult = await queryClient.ensureQueryData(userStatusQueryOptions())
      const status = statusResult?.status ?? 'blocked'

      if (status === 'approved') {
        toast.success('Access approved! Redirecting...')
        await router.invalidate()
        router.navigate({ to: '/tours' })
      } else if (status === 'pending') {
        toast.info('Status updated to pending review.')
        await router.invalidate()
        router.navigate({ to: '/pending' })
      } else {
        toast.info('Still under review. Our team is working on it.')
      }
    } catch (error) {
      console.error('Failed to check status:', error)
      toast.error('Could not refresh status. Please try again.')
    }
  }

  const handleSignOut = async () => {
    await signOutFn({ data: {} })
    queryClient.clear()
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  return <BlockedPage onSignOut={handleSignOut} onCheckStatus={handleCheckStatus} isCheckingStatus={false} />
}
