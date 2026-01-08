import { Providers as CoreProviders } from '@valguide/core/features/app-providers/providers'
import type { Theme } from '@valguide/core/features/app-theme/types'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import type { PropsWithChildren } from 'react'
import { setThemeFn } from '@/features/theme/server-functions'

type ProvidersProps = PropsWithChildren<{
  locale: SupportedLocale
  initialTheme: Theme
}>

export function Providers({ locale, initialTheme, children }: ProvidersProps) {
  return (
    <CoreProviders locale={locale} initialTheme={initialTheme} setThemeFn={setThemeFn}>
      {children}
    </CoreProviders>
  )
}
