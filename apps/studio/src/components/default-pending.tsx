import { Spinner } from '@valguide/ui/components/spinner'

export function DefaultPending() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  )
}
