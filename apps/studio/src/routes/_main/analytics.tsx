import { createFileRoute } from '@tanstack/react-router'

import { useTranslations } from '@valguide/core/i18n/mock'

export const Route = createFileRoute('/_main/analytics')({
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const t = useTranslations('sidebar')
  return (
    <main className="min-h-svh flex flex-col flex-1 items-center justify-center px-8">
      <article className="max-w-2xl items-center flex flex-col gap-4 text-center">
        <h1 className="text-6xl font-bold">{t('nav.analytics')}</h1>
        <p>{t('pages.analytics.description')}</p>
      </article>
    </main>
  )
}
