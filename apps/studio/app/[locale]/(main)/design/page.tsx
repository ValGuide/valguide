import type { PageParamsWithLocale } from '@valguide/core/utils/types'
import { i18nStaticParams } from '@valguide/i18n/i18n.config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ThemeCustomizer } from '../../../../features/design/components/theme-customizer'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function DesignPage({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'sidebar' })

  return (
    <main className="flex flex-col flex-1 min-h-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('nav.design')}</h1>
        <p className="text-muted-foreground mt-1">{t('pages.design.description')}</p>
      </div>
      <div className="flex-1 min-h-0">
        <ThemeCustomizer initialTheme="light" />
      </div>
    </main>
  )
}
