import { useRouterState } from '@tanstack/react-router'
import { cn } from '@valguide/ui/lib/utils'
import { type CSSProperties, type PropsWithChildren, useEffect, useRef, useState } from 'react'

type StudioPageTransitionProps = PropsWithChildren<{
  className?: string
}>

export function StudioPageTransition({ className, children }: StudioPageTransitionProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [animationCycle, setAnimationCycle] = useState(0)
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return
    }

    previousPathnameRef.current = pathname
    setAnimationCycle((currentCycle) => currentCycle + 1)
  }, [pathname])

  const transitionStyle = {
    animationName: animationCycle % 2 === 0 ? 'studio-page-enter-a' : 'studio-page-enter-b',
  } satisfies CSSProperties

  return (
    <div
      className={cn('studio-page-transition flex min-h-0 flex-1 flex-col', className)}
      data-page-transition
      style={transitionStyle}
    >
      {children}
    </div>
  )
}
