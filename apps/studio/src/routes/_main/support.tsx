import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'

export const Route = createFileRoute('/_main/support')({
  component: SupportPage,
})

function SupportPage() {
  const t = useTranslations('sidebar')
  return (
    <main className="min-h-full flex flex-1 flex-col items-center justify-center px-8">
      <article className="max-w-2xl items-center flex flex-col gap-4 text-center">
        <h1 className="text-6xl font-bold">{t('nav.support')}</h1>
        <p>{t('pages.support.description')}</p>
      </article>
    </main>
  )
}
