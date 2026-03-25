import { useRouterState } from '@tanstack/react-router'
import { cn } from '@valguide/ui/lib/utils'
import { type CSSProperties, type PropsWithChildren, useEffect, useRef, useState } from 'react'

type StudioPageTransitionProps = PropsWithChildren<{
  className?: string
}>

export function StudioPageTransition({ className, children }: StudioPageTransitionProps) {
  const resolvedPathname = useRouterState({
    select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname,
  })
  const [animationCycle, setAnimationCycle] = useState(0)
  const previousResolvedPathnameRef = useRef(resolvedPathname)

  useEffect(() => {
    if (previousResolvedPathnameRef.current === resolvedPathname) {
      return
    }

    previousResolvedPathnameRef.current = resolvedPathname
    setAnimationCycle((currentCycle) => currentCycle + 1)
  }, [resolvedPathname])

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
