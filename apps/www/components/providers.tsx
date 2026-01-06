'use client'

import { Toaster } from '@valguide/ui/components/sonner'
import { themes } from '@valguide/ui/theme/themes'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      themes={[...themes]}
    >
      {children}
      <Toaster />
    </NextThemesProvider>
  )
}
