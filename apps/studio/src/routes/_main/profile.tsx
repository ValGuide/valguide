import { createFileRoute } from '@tanstack/react-router'
import { currentUserQueryOptions } from '@valguide/core/features/auth/query-options'
import { ProfileSkeleton } from '@/features/profile/components/profile-skeleton'
import { profileQueryOptions } from '@/features/profile/query-options'

export const Route = createFileRoute('/_main/profile')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQueryOptions()),
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
    ]),
  pendingComponent: ProfileSkeleton,
})
