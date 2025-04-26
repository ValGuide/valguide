import { Skeleton } from '@valguide/ui/components/skeleton'

export default function Loading() {
  return (
    <div className="min-h-dvh flex flex-1 justify-center items-center">
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}
