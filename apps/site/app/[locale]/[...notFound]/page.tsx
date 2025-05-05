import NotFoundPage from '@/app/[locale]/[...notFound]/not-found-page'
import { PageParamsWithLocale } from '@valguide/core/utils/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const runtime = 'edge'

export default async function CatchAllPage({ params }: PageParamsWithLocale) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'notFound' })
  return (
    <NotFoundPage
      i18n={{
        title: t('title'),
        description: t('description'),
      }}
    />
  )
}
