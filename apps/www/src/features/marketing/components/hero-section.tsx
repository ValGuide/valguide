import { useTranslations } from '@valguide/core/i18n/client'

export function HeroSection() {
  const t = useTranslations('www.hero')
  const tStats = useTranslations('www.stats')

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(194,167,108,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(31,41,55,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,248,237,0.92),_rgba(255,255,255,1))]" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,420px)] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t('eyebrow')}
          </p>
          <h1 className="max-w-4xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{t('description')}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:support@valguide.com?subject=ValGuide%20demo"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              {t('primaryCta')}
            </a>
            <a
              href="mailto:support@valguide.com?subject=ValGuide%20pilot"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background/90 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              {t('secondaryCta')}
            </a>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{tStats('speedLabel')}</dt>
              <dd className="mt-2 font-serif text-2xl">{tStats('speedValue')}</dd>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{tStats('operationsLabel')}</dt>
              <dd className="mt-2 font-serif text-2xl">{tStats('operationsValue')}</dd>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{tStats('accessibilityLabel')}</dt>
              <dd className="mt-2 font-serif text-2xl">{tStats('accessibilityValue')}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-stone-950 p-5 text-stone-50 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-300">{t('diagramMuseum')}</p>
                <p className="mt-2 font-serif text-xl">{t('diagramMuseumValue')}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-300">
                <div className="h-px flex-1 bg-white/15" />
                <span>{t('diagramArrow')}</span>
                <div className="h-px flex-1 bg-white/15" />
              </div>
              <div className="rounded-2xl bg-amber-100 p-4 text-stone-950">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-600">{t('diagramPhone')}</p>
                <p className="mt-2 font-serif text-xl">{t('diagramPhoneValue')}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-300">
                <div className="h-px flex-1 bg-white/15" />
                <span>{t('diagramArrow')}</span>
                <div className="h-px flex-1 bg-white/15" />
              </div>
              <div className="rounded-2xl bg-emerald-200 p-4 text-stone-950">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-700">{t('diagramGuide')}</p>
                <p className="mt-2 font-serif text-xl">{t('diagramGuideValue')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
