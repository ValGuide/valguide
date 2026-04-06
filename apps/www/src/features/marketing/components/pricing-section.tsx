import { useTranslations } from '@valguide/core/i18n/client'

export function PricingSection() {
  const t = useTranslations('www.pricing')

  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{t('eyebrow')}</p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">{t('title')}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{t('description')}</p>
          <div className="mt-6 rounded-[1.75rem] border border-amber-300/50 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
            {t('philosophy')}
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {['starter', 'professional', 'enterprise'].map((key) => (
            <article
              key={key}
              className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition lg:hover:-translate-y-1 lg:hover:shadow-md"
            >
              <p className="text-sm font-medium text-muted-foreground">{t(`${key}.label`)}</p>
              <p className="mt-2 font-serif text-4xl tracking-tight">{t(`${key}.price`)}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(`${key}.description`)}</p>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-muted-foreground">
                {[1, 2, 3].map((item) => (
                  <li key={item}>{t(`${key}.point${item}`)}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-[2rem] border border-border bg-stone-900 px-6 py-6 text-stone-50 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-medium">{t('offsetTitle')}</p>
            <p className="mt-1 text-sm leading-6 text-stone-300">{t('offsetBody')}</p>
          </div>
          <a
            href="mailto:support@valguide.com?subject=ValGuide%20pricing"
            className="inline-flex items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100"
          >
            {t('cta')}
          </a>
        </div>
      </div>
    </section>
  )
}

export function PilotSection() {
  const t = useTranslations('www.pilot')

  return (
    <section id="pilot" className="bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{t('eyebrow')}</p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">{t('title')}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{t('description')}</p>
        </div>
        <div className="rounded-[1.75rem] bg-stone-950 p-6 text-stone-50">
          <ul className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <li key={item} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                <p className="font-medium">{t(`step${item}.title`)}</p>
                <p className="mt-1 text-sm leading-6 text-stone-300">{t(`step${item}.body`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
