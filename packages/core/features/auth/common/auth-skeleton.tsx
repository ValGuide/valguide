import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import type React from 'react'

export interface AuthSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuthSkeleton({ className, ...props }: AuthSkeletonProps) {
  return (
    <div className={cn('flex flex-col justify-center space-y-8', className)} {...props}>
      {/* Brand cue, title and subtitle skeletons */}
      <div className="text-center space-y-2">
        <Skeleton className="h-3 w-16 mx-auto" /> {/* ValGuide brand */}
        <Skeleton className="h-9 w-40 mx-auto mt-3" /> {/* Title */}
        <Skeleton className="h-5 w-64 mx-auto" /> {/* Subtitle */}
      </div>

      {/* Form skeleton */}
      <div className="space-y-6">
        {/* Label and input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
        {/* Button */}
        <Skeleton className="h-10 w-full" /> {/* Button */}
        {/* Link text */}
        <div className="text-center mt-4">
          <Skeleton className="h-5 w-48 mx-auto" /> {/* Link text */}
        </div>
      </div>
    </div>
  )
}
