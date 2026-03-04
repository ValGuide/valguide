import { Providers as CoreProviders } from '@valguide/core/features/app-providers/providers'
import type { Theme } from '@valguide/core/features/app-theme/types'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { type PropsWithChildren, useEffect } from 'react'
import { setThemeFn } from '@/features/theme/set-theme.fn'
import { registerServiceWorker } from '@/sw'

type ProvidersProps = PropsWithChildren<{
  locale: SupportedLocale
  initialTheme: Theme
}>

export function Providers({ locale, initialTheme, children }: ProvidersProps) {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <CoreProviders app="app" locale={locale} initialTheme={initialTheme} setThemeFn={setThemeFn}>
      {children}
    </CoreProviders>
  )
}
