import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { PageTitle } from '@valguide/ui/components/page-title'
import { ProfileFormConnected } from '@/features/profile/components/profile-form-connected'
import { ProfileSkeleton } from '@/features/profile/components/profile-skeleton'
import { profileQueryOptions } from '@/features/profile/query-options'

export const Route = createFileRoute('/_main/profile')({
  component: ProfilePage,
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions()),
  pendingComponent: ProfileSkeleton,
})

function ProfilePage() {
  const t = useTranslations('profile')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <PageTitle as="h2" size="lg">
            {t('title')}
          </PageTitle>
        </div>
        <ProfileFormConnected />
      </div>
    </div>
  )
}
