import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'

export function TrustSection() {
  const t = useTranslations('www.trust')

  return (
    <section id="about" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,360px)]">
        <article className="rounded-[2rem] border border-border bg-card p-6 shadow-sm lg:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{t('eyebrow')}</p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">{t('title')}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{t('body')}</p>
        </article>

        <article className="rounded-[2rem] border border-border bg-stone-950 p-6 text-stone-50 shadow-sm lg:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">{t('trustPanelEyebrow')}</p>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-stone-300">
            {[1, 2, 3, 4].map((item) => (
              <li key={item}>{t(`trustPoint${item}`)}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}

export function SiteFooter() {
  const t = useTranslations('www.footer')

  return (
    <footer className="border-t border-border bg-stone-950 px-4 py-10 text-stone-200 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="font-serif text-2xl text-white">ValGuide</p>
          <p className="mt-2 text-sm leading-6 text-stone-400">{t('description')}</p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-stone-300 sm:flex-row sm:items-center sm:gap-6">
          <a href="mailto:support@valguide.com" className="transition hover:text-white">
            support@valguide.com
          </a>
          <Link to="/privacy-policy" className="transition hover:text-white">
            {t('privacy')}
          </Link>
          <Link to="/terms-of-service" className="transition hover:text-white">
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
