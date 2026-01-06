
import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import type React from 'react'
import { AuthSkeleton } from './auth-skeleton'
import { OtpSkeleton } from './otp-skeleton'

export interface AuthSkeletonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the OTP verification skeleton
   */
  showOtp?: boolean
}

export function AuthSkeletonContainer({ className, showOtp = false, ...props }: AuthSkeletonContainerProps) {
  return (
    <>
      <div className={cn('flex flex-1 flex-col justify-center mt-16 mb-8', className)} {...props}>
        {showOtp ? <OtpSkeleton /> : <AuthSkeleton />}
      </div>
      {/* Consent message skeleton */}
      <div className="w-full pt-10">
        <div className="text-center max-w-md mx-auto">
          <Skeleton className="h-4 w-96 mx-auto" />
          {/* Single line for "By continuing, you agree to our Terms of Service and Privacy Policy." */}
        </div>
      </div>
    </>
  )
}
