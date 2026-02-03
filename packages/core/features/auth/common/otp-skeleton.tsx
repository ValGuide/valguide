import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import type React from 'react'

export interface OtpSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function OtpSkeleton({ className, ...props }: OtpSkeletonProps) {
  return (
    <div className={cn('flex flex-col justify-center space-y-6', className)} {...props}>
      <div className="text-center space-y-3">
        <Skeleton className="h-9 w-44 mx-auto" />
        <Skeleton className="h-10 sm:h-5 w-full sm:w-64 mx-auto" />
      </div>

      <div className="space-y-6">
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <div className="flex gap-1.5 sm:gap-2.5">
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
          </div>
          <div className="flex gap-1.5 sm:gap-2.5">
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-4 w-52 mx-auto" />
        <Skeleton className="h-10 sm:h-4 w-full sm:w-64 mx-auto" />
      </div>
    </div>
  )
}
