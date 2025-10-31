'use client'

import React from 'react'
import { cn } from '@valguide/ui/lib/utils'
import { Skeleton } from '@valguide/ui/components/skeleton'

export interface OtpSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function OtpSkeleton({ className, ...props }: OtpSkeletonProps) {
  return (
    <div className={cn('flex flex-col justify-center space-y-6', className)} {...props}>
      {/* Title and subtitle skeletons */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-48 mx-auto" /> {/* Title: "Verify Your Email" */}
        <Skeleton className="h-5 w-80 mx-auto" /> {/* Subtitle: "Please enter the verification code we sent to..." */}
      </div>

      {/* OTP input skeleton - matching the actual component with larger slots and separator */}
      <div className="space-y-6">
        {/* OTP slots - larger size matching h-16 w-12 with gaps */}
        <div className="flex justify-center items-center gap-4">
          {/* First group of 3 slots */}
          <div className="flex gap-2.5">
            <Skeleton className="h-16 w-12 rounded-md" /> {/* OTP slot 1 */}
            <Skeleton className="h-16 w-12 rounded-md" /> {/* OTP slot 2 */}
            <Skeleton className="h-16 w-12 rounded-md" /> {/* OTP slot 3 */}
          </div>
          {/* Separator */}
          <div className="w-2 h-0.5 bg-border" />
          {/* Second group of 3 slots */}
          <div className="flex gap-2.5">
            <Skeleton className="h-16 w-12 rounded-md" /> {/* OTP slot 4 */}
            <Skeleton className="h-16 w-12 rounded-md" /> {/* OTP slot 5 */}
            <Skeleton className="h-16 w-12 rounded-md" /> {/* OTP slot 6 */}
          </div>
        </div>

        {/* Verify Button */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Resend text below button */}
        <div className="text-center">
          <Skeleton className="h-4 w-56 mx-auto" /> {/* "Didn't receive the code? Resend" */}
        </div>
      </div>
    </div>
  )
}
