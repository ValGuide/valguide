import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import type React from 'react'

export interface AuthSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuthSkeleton({ className, ...props }: AuthSkeletonProps) {
  return (
    <div className={cn('flex flex-col justify-center space-y-8', className)} {...props}>
      <div className="text-center space-y-3">
        <Skeleton className="h-9 w-48 mx-auto" />
        <Skeleton className="h-10 sm:h-5 w-full sm:w-64 mx-auto" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
