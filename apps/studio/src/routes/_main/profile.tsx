import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/mock'
import { ProfileForm } from '@/features/profile/components/profile-form'

export const Route = createFileRoute('/_main/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const t = useTranslations('profile')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        </div>
        <ProfileForm />
      </div>
    </div>
  )
}
