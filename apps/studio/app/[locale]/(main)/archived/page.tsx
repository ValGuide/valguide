import { ArchivedPageContainer } from './container'
import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { setRequestLocale } from 'next-intl/server'
import { PageParamsWithLocale } from '@valguide/core/utils/types'

export const dynamic = 'error'
export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function ArchivedPage({ params }: PageParamsWithLocale) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ArchivedPageContainer />
}
