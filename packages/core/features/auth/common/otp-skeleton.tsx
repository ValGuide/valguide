import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import type React from 'react'

export interface OtpSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function OtpSkeleton({ className, ...props }: OtpSkeletonProps) {
  return (
    <div className={cn('flex flex-col justify-center space-y-6', className)} {...props}>
      {/* Brand cue, title and subtitle skeletons */}
      <div className="text-center space-y-2">
        <Skeleton className="h-3 w-16 mx-auto" /> {/* ValGuide brand */}
        <Skeleton className="h-9 w-48 mx-auto mt-3" /> {/* Title: "Verify Your Email" */}
        <Skeleton className="h-5 w-80 mx-auto" /> {/* Subtitle: "Please enter the verification code we sent to..." */}
      </div>

      {/* OTP input skeleton - responsive sizes matching actual component */}
      <div className="space-y-6">
        {/* OTP slots - responsive h-12 w-10 on mobile, h-16 w-12 on sm+ */}
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          {/* First group of 3 slots */}
          <div className="flex gap-1.5 sm:gap-2.5">
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
          </div>
          {/* Second group of 3 slots */}
          <div className="flex gap-1.5 sm:gap-2.5">
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
            <Skeleton className="h-12 w-10 sm:h-16 sm:w-12 rounded-md" />
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
