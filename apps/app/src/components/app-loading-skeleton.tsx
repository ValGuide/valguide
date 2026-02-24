import { Spinner } from '@valguide/core/ui/components/spinner'

export function AppLoadingSkeleton() {
  return (
    <main className="min-h-svh flex items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </main>
  )
}
