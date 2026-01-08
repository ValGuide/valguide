import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const t = useTranslations('comingSoon')

  return (
    <main className="min-h-svh flex flex-col flex-1 items-center justify-center px-8">
      <article className="max-w-2xl items-center flex flex-col gap-4 text-center">
        <h1 className="text-6xl font-bold">{t('title')}</h1>
        <p>{t('description')}</p>
      </article>
    </main>
  )
}
