import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'

export function ComingSoonPage() {
  const t = useTranslations('www.comingSoon')
  // i18n-used-keys: www.comingSoon.eyebrow, www.comingSoon.title, www.comingSoon.body, www.comingSoon.policiesCta

  return (
    <main className="flex min-h-svh items-center bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{t('eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">{t('body')}</p>
        <div className="mt-8">
          <Link
            to="/policies"
            className="inline-flex rounded-full border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            {t('policiesCta')}
          </Link>
        </div>
      </div>
    </main>
  )
}
