import { useSuspenseQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { currentUserQueryOptions } from '@valguide/core/features/auth/query-options'
import { deactivateAccountFn } from '@valguide/core/features/profiles/deactivate-account.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { PageTitle } from '@valguide/ui/components/page-title'
import { DeactivateAccountCard } from '@/features/profile/components/deactivate-account-card'
import { ProfileFormConnected } from '@/features/profile/components/profile-form-connected'

export const Route = createLazyFileRoute('/_main/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const t = useTranslations('profile')
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  const handleDeactivateAccount = async () => {
    try {
      await deactivateAccountFn()
      window.location.href = '/login'
    } catch {
      toast.error(t('deactivateAccount.error'))
    }
  }

  return (
    <div data-testid="profile-page" className="flex-1 space-y-4 p-6 pt-6 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <PageTitle as="h2" size="lg">
          {t('title')}
        </PageTitle>
        <ProfileFormConnected />
        <DeactivateAccountCard email={user?.email} onDeactivate={handleDeactivateAccount} />
      </div>
    </div>
  )
}
