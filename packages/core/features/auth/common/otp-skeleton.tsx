'use client'

import React from 'react'
import { cn } from '@valguide/ui/lib/utils'
import { Skeleton } from '@valguide/ui/components/skeleton'

export interface OtpSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function OtpSkeleton({ className, ...props }: OtpSkeletonProps) {
  return (
    <div className={cn('flex flex-col justify-center space-y-8', className)} {...props}>
      {/* Title and subtitle skeletons */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-40 mx-auto" /> {/* Title */}
        <Skeleton className="h-5 w-64 mx-auto" /> {/* Subtitle */}
      </div>

      {/* OTP input skeleton */}
      <div className="space-y-6">
        {/* Label */}
        <div className="text-center">
          <Skeleton className="h-5 w-32 mx-auto" /> {/* Label */}
        </div>
        {/* OTP slots */}
        <div className="flex justify-center space-x-2">
          <Skeleton className="h-12 w-10" /> {/* OTP slot 1 */}
          <Skeleton className="h-12 w-10" /> {/* OTP slot 2 */}
          <Skeleton className="h-12 w-10" /> {/* OTP slot 3 */}
          <Skeleton className="h-12 w-10" /> {/* OTP slot 4 */}
          <Skeleton className="h-12 w-10" /> {/* OTP slot 5 */}
          <Skeleton className="h-12 w-10" /> {/* OTP slot 6 */}
        </div>
        {/* Button */}
        <Skeleton className="h-10 w-full" /> {/* Button */}
        {/* Resend text */}
        <div className="text-center mt-4">
          <Skeleton className="h-5 w-64 mx-auto" /> {/* Resend text */}
        </div>
      </div>
    </div>
  )
}
