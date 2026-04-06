import { Link } from '@tanstack/react-router'
import { LocaleSwitcher } from '@valguide/core/i18n/components/locale-switcher'
import { useTranslations } from '@valguide/core/i18n/client'

export function LocaleChrome() {
  const t = useTranslations('www.nav')

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <span className="font-serif text-lg font-semibold">V</span>
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold tracking-tight">ValGuide</p>
            <p className="text-xs text-muted-foreground">{t('tagline')}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <a
            href="mailto:support@valguide.com?subject=ValGuide%20demo"
            className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 sm:inline-flex"
          >
            {t('primaryCta')}
          </a>
        </div>
      </div>
    </header>
  )
}
