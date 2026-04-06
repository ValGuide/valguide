import { Link } from '@tanstack/react-router'
import { PageTitle } from '@valguide/core/ui/components/page-title'

type LegalNotFoundPageProps = {
  title: string
  description: string
  policiesLabel: string
  privacyLabel: string
  termsLabel: string
  cookieLabel: string
}

export function LegalNotFoundPage({
  title,
  description,
  policiesLabel,
  privacyLabel,
  termsLabel,
  cookieLabel,
}: LegalNotFoundPageProps) {
  return (
    <main className="flex min-h-svh items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-8 shadow-sm sm:p-10">
        <PageTitle size="xl">{title}</PageTitle>
        <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/policies"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            {policiesLabel}
          </Link>
          <Link
            to="/privacy-policy"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            {privacyLabel}
          </Link>
          <Link
            to="/terms-of-service"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            {termsLabel}
          </Link>
          <Link
            to="/cookie-policy"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            {cookieLabel}
          </Link>
        </div>
      </div>
    </main>
  )
}
