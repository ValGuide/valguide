import { useSuspenseQuery } from '@tanstack/react-query'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { currentUserQueryOptions } from '@valguide/core/features/auth/query-options'
import { deleteAccountFn } from '@valguide/core/features/profiles/delete-account.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { PageTitle } from '@valguide/ui/components/page-title'
import { DeleteAccountCard } from '@/features/profile/components/delete-account-card'
import { ProfileFormConnected } from '@/features/profile/components/profile-form-connected'

export const Route = createLazyFileRoute('/_main/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const t = useTranslations('profile')
  const router = useRouter()
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountFn()
      await router.invalidate()
      router.navigate({ to: '/login' })
    } catch {
      toast.error(t('deleteAccount.error'))
    }
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-6 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <PageTitle as="h2" size="lg">
          {t('title')}
        </PageTitle>
        <ProfileFormConnected />
        <DeleteAccountCard email={user?.email} onDelete={handleDeleteAccount} />
      </div>
    </div>
  )
}
