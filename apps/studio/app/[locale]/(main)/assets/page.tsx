import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { setRequestLocale } from 'next-intl/server'
import { AssetsPageClient } from './page.client'

interface AssetsPageParams {
  locale: string
}

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function AssetsPage({ params }: { params: Promise<AssetsPageParams> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AssetsPageClient />
}
