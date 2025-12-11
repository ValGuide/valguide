import { getTranslations } from 'next-intl/server'

export default async function SupportPage() {
  const t = await getTranslations('sidebar')
  return (
    <main className="min-h-svh flex flex-col flex-1 items-center justify-center px-8">
      <article className="max-w-2xl items-center flex flex-col gap-4 text-center">
        <h1 className="text-6xl font-bold">{t('nav.support')}</h1>
        <p>{t('pages.support.description')}</p>
      </article>
    </main>
  )
}
