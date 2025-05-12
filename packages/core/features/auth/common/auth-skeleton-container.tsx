'use client'

import React from 'react'
import { cn } from '@valguide/ui/lib/utils'
import { AuthSkeleton } from './auth-skeleton'
import { OtpSkeleton } from './otp-skeleton'
import { Skeleton } from '@valguide/ui/components/skeleton'

export interface AuthSkeletonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the OTP verification skeleton
   */
  showOtp?: boolean
}

export function AuthSkeletonContainer({ className, showOtp = false, ...props }: AuthSkeletonContainerProps) {
  return (
    <>
      <div className={cn('flex flex-1 flex-col justify-center', className)} {...props}>
        {showOtp ? <OtpSkeleton /> : <AuthSkeleton />}
      </div>
      {/* Consent message skeleton */}
      <div className="w-full py-4 border-t">
        <div className="text-center max-w-md mx-auto flex flex-wrap justify-center gap-1.5">
          <Skeleton className="h-5 w-24" /> {/* "By continuing, you agree to our" */}
          <Skeleton className="h-5 w-32" /> {/* "Terms of Service" */}
          <Skeleton className="h-5 w-10" /> {/* "and" */}
          <Skeleton className="h-5 w-28" /> {/* "Privacy Policy" */}
          <Skeleton className="h-5 w-3" /> {/* "." */}
        </div>
      </div>
    </>
  )
}
