import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { setRequestLocale } from 'next-intl/server'
import { PageParamsWithLocale } from '@valguide/core/utils/types'
import { GuidesList } from '@/components/guides-list'
import { Guide } from '@valguide/core/features/guides/schema'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function Page({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)

  // TODO: Fetch guides from database
  const guides: Guide[] = []

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <GuidesList guides={guides} />
    </main>
  )
}
