import { useTranslations } from '@valguide/core/i18n/client'

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  )
}

export function ProblemSection() {
  const t = useTranslations('www.problem')

  return (
    <section id="problem" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {['apps', 'hardware', 'content', 'accessibility', 'budget', 'temporary'].map((key) => (
            <article key={key} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-2xl tracking-tight">{t(`${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(`${key}.body`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SolutionSection() {
  const t = useTranslations('www.solution')

  return (
    <section id="solution" className="bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <div>
          <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {['web', 'brand', 'ai', 'languages', 'accessibility', 'analytics'].map((key) => (
              <article key={key} className="rounded-[1.75rem] border border-border/70 bg-background p-5 shadow-sm">
                <h3 className="font-medium">{t(`${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`${key}.body`)}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{t('howItWorksEyebrow')}</p>
          <ol className="mt-6 space-y-5">
            {[1, 2, 3].map((step) => (
              <li key={step} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white">
                  {step}
                </div>
                <div>
                  <p className="font-medium">{t(`step${step}.title`)}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(`step${step}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  )
}

export function WhySection() {
  const t = useTranslations('www.why')

  return (
    <section id="why" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {['audio', 'apps', 'agencies'].map((key) => (
            <article key={key} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-2xl tracking-tight">{t(`${key}.title`)}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {[1, 2, 3].map((item) => (
                  <li key={item}>{t(`${key}.point${item}`)}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function UseCasesSection() {
  const t = useTranslations('www.useCases')

  return (
    <section id="use-cases" className="bg-stone-950 px-4 py-16 text-stone-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {['permanent', 'temporary', 'multilingual', 'accessibility', 'education', 'tourism'].map((key) => (
            <article key={key} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <h3 className="font-serif text-2xl tracking-tight text-white">{t(`${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-300">{t(`${key}.body`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
