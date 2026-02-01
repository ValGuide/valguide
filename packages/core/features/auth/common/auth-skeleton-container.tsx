import { Card, CardContent } from '@valguide/core/ui/components/card'
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
    <main
      className={cn('min-h-svh flex flex-col items-center justify-center p-4 relative overflow-hidden', className)}
      {...props}
    >
      {/* Background with subtle gradient */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]',
          'from-background via-muted to-muted',
          'dark:from-muted/50 dark:via-background dark:to-background',
        )}
      />

      {/* Subtle topography-style pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpath fill='none' stroke='%23000' stroke-width='0.5' d='M0 50 Q50 20 100 50 T200 50 M0 100 Q50 70 100 100 T200 100 M0 150 Q50 120 100 150 T200 150'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Card */}
      <Card
        className={cn(
          'relative w-full max-w-md',
          'shadow-xl shadow-black/5 dark:shadow-black/20',
          'border border-border/50',
          'rounded-2xl',
        )}
      >
        <CardContent className="p-8">
          <div className="flex flex-1 flex-col justify-center gap-6">
            {showOtp ? <OtpSkeleton /> : <AuthSkeleton />}
          </div>
        </CardContent>
      </Card>

      {/* Footer - consent skeleton */}
      <div className="relative mt-6 text-center px-4">
        <Skeleton className="h-8 sm:h-4 w-full sm:w-80 max-w-xs sm:max-w-none mx-auto" />
      </div>
    </main>
  )
}
