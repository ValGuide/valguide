import { Link } from '@tanstack/react-router'
import { cn } from '@valguide/ui/lib/utils'

type LegalPageShellProps = {
  currentPath: '/policies' | '/privacy-policy' | '/terms-of-service'
  title: string
  body: string
  policiesLabel: string
  privacyLabel: string
  termsLabel: string
}

export function LegalPageShell({
  currentPath,
  title,
  body,
  policiesLabel,
  privacyLabel,
  termsLabel,
}: LegalPageShellProps) {
  return (
    <main className="min-h-svh bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap gap-3">
          <Link
            to="/policies"
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              currentPath === '/policies'
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
            )}
          >
            {policiesLabel}
          </Link>
          <Link
            to="/privacy-policy"
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              currentPath === '/privacy-policy'
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
            )}
          >
            {privacyLabel}
          </Link>
          <Link
            to="/terms-of-service"
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              currentPath === '/terms-of-service'
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
            )}
          >
            {termsLabel}
          </Link>
        </nav>
        <div className="mt-6 rounded-[2rem] border border-border bg-card p-8 shadow-sm sm:p-10">
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{body}</p>
        </div>
      </div>
    </main>
  )
}
