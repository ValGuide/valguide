import { Toaster } from '@valguide/ui/components/sonner'
import type { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
