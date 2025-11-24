import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageParamsWithLocale } from '@valguide/core/utils/types'
import { ProfileForm } from '@/features/profile/components/profile-form'
import { i18nStaticParams } from '@valguide/i18n/i18n.config'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function ProfilePage({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'profile' })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  )
}
