import { getTranslations } from '@valguide/core/i18n/mock-server'
import type { PageParamsWithLocale } from '@valguide/core/utils/types'
import { NotFoundPage } from '@valguide/features/404/not-found-page'
import { i18nStaticParams } from '@valguide/i18n/i18n.config'

export const generateStaticParams = () => i18nStaticParams

export default async function CatchAllPage({ params }: PageParamsWithLocale) {
  const { locale } = await params
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
