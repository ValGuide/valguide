import { useLocation } from '@tanstack/react-router'
import { cn } from '@valguide/ui/lib/utils'
import type { PropsWithChildren } from 'react'

type StudioPageTransitionProps = PropsWithChildren<{
  className?: string
}>

export function StudioPageTransition({ className, children }: StudioPageTransitionProps) {
  const location = useLocation()

  return (
    <div
      key={location.pathname}
      className={cn('studio-page-transition flex min-h-0 flex-1 flex-col', className)}
      data-page-transition
    >
      {children}
    </div>
  )
}
