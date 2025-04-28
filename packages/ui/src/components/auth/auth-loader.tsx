'use client'

import React from 'react'
import { cn } from '@valguide/ui/lib/utils'

export interface AuthLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function AuthLoader({ className, size = 'md', ...props }: AuthLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)} {...props}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>

        {/* Middle circle */}
        <div className="absolute inset-2 rounded-full border-4 border-r-primary border-l-transparent border-t-transparent border-b-transparent animate-spin-slow"></div>

        {/* Inner circle */}
        <div className="absolute inset-4 rounded-full border-4 border-b-primary border-r-transparent border-t-transparent border-l-transparent animate-bounce-slow"></div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
