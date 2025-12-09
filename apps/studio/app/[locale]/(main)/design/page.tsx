import type { PageParamsWithLocale } from '@valguide/core/utils/types'
import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { setRequestLocale } from 'next-intl/server'
import { DesignPageClient } from './page.client'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function DesignPage({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)

  return <DesignPageClient />
}
