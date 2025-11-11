import { setRequestLocale } from 'next-intl/server'
import { AssetsPageClient } from './page.client'

interface AssetsPageParams {
  locale: string
}

export const dynamic = 'force-dynamic'

export default async function AssetsPage({ params }: { params: Promise<AssetsPageParams> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AssetsPageClient />
}
