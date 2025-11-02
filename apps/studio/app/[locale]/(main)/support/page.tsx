import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageParamsWithLocale } from '@valguide/core/utils/types'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function SupportPage({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'sidebar' })
  return (
    <main className="min-h-svh flex flex-col flex-1 items-center justify-center px-8">
      <article className="max-w-2xl items-center flex flex-col gap-4 text-center">
        <h1 className="text-6xl font-bold">{t('nav.support')}</h1>
        <p>{t('pages.support.description')}</p>
      </article>
    </main>
  )
}
