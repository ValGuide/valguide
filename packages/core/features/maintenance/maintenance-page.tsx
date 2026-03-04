import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import type { MaintenancePageI18n } from './i18n'

export type MaintenancePageProps = {
  appName: string
  locale: SupportedLocale
  i18n: MaintenancePageI18n
  message: string | null
  eta: string | null
}

function formatLocalizedEta(eta: string | null, locale: SupportedLocale): string | null {
  if (!eta) return null
  const trimmed = eta.trim()
  if (!trimmed) return null

  const primaryDate = new Date(trimmed)
  const fallbackDate = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed) ? new Date(trimmed.replace(' ', 'T')) : null
  const date = Number.isNaN(primaryDate.getTime()) ? fallbackDate : primaryDate
  if (!date || Number.isNaN(date.getTime())) {
    return trimmed
  }

  try {
    return new Intl.DateTimeFormat('locale', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return trimmed
  }
}

export function MaintenancePage({ appName, locale, i18n, message, eta }: MaintenancePageProps) {
  const localizedEta = formatLocalizedEta(eta, locale)

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <article className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl items-center">
        <section className="w-full rounded-2xl border border-border/80 bg-card/90 p-6 shadow-lg backdrop-blur sm:p-8">
          <header className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">{appName}</p>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              {i18n.label}
            </Badge>
          </header>

          <h1 className="font-serif text-2xl leading-tight text-card-foreground sm:text-3xl">{i18n.title}</h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {message ?? i18n.description}
          </p>

          <p className="mt-4 text-sm font-medium text-muted-foreground">{i18n.status}</p>

          {localizedEta ? (
            <p className="mt-3 text-sm text-muted-foreground">{i18n.estimatedEnd.replace('{time}', localizedEta)}</p>
          ) : null}

          <div className="mt-6 flex items-center gap-2">
            <Button type="button" variant="outline" data-retry-button>
              {i18n.retryAction}
            </Button>
          </div>
        </section>
      </article>
    </main>
  )
}
