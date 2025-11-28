'use client'

import type { PropsWithLocale } from '@valguide/core/utils/types'
import { Toaster } from '@valguide/ui/components/sonner'
import { themes } from '@valguide/ui/theme/themes'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { PropsWithChildren } from 'react'

interface ProvidersProps extends PropsWithLocale {
  messages: Record<string, unknown>
}

export function Providers({ children, locale, messages }: PropsWithChildren<ProvidersProps>) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Zurich">
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
    </NextIntlClientProvider>
  )
}
