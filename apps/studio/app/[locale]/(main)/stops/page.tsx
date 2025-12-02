import type { PageParamsWithLocale } from '@valguide/core/utils/types'
import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { setRequestLocale } from 'next-intl/server'
import { StopsListContainer } from '@/features/stops'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function StopsPage({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StopsListContainer />
    </main>
  )
}
