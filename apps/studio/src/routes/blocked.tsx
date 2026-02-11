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
  const [accessRequested, setAccessRequested] = useState(false)

  // Notify team of blocked access attempt
  useEffect(() => {
    notifyStudioBlockedAccessFn({ data: {} })
  }, [])

  const { mutate: requestAccess, isPending } = useMutation({
    mutationFn: async () => {
      // Just show success - notification already sent on page load
      return Promise.resolve()
    },
    onSuccess: () => {
      setAccessRequested(true)
      toast.success('Access request sent. Our team will review it shortly.')
    },
    onError: () => {
      toast.error('Failed to send access request. Please try again.')
    },
  })

  const handleSignOut = async () => {
    await signOutFn({ data: {} })
    queryClient.clear()
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  return (
    <BlockedPage
      onSignOut={handleSignOut}
      onRequestAccess={!accessRequested && !isPending ? () => requestAccess() : undefined}
    />
  )
}
