'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { PropsWithChildren } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { PropsWithLocale } from '@/utils/types'
import { themes } from '@valguide/ui/theme/themes'

export function Providers({ children, locale }: PropsWithChildren<PropsWithLocale>) {
  return (
    <NextIntlClientProvider locale={locale}>
      <NextThemesProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        themes={[...themes]}
      >
        {children}
      </NextThemesProvider>
    </NextIntlClientProvider>
  )
}
