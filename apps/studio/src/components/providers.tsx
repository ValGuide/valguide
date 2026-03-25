import { Providers as CoreProviders } from '@valguide/core/features/app-providers/providers'
import type { Theme } from '@valguide/core/features/app-theme/types'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import type { PropsWithChildren } from 'react'
import { StudioOverlayHost } from '@/components/studio-overlay-host'
import { AssetUploadSessionProvider } from '@/features/assets/upload-session/asset-upload-session'
import { setThemeFn } from '@/features/theme/set-theme.fn'

type ProvidersProps = PropsWithChildren<{
  locale: SupportedLocale
  initialTheme: Theme
}>

export function Providers({ locale, initialTheme, children }: ProvidersProps) {
  return (
    <CoreProviders
      app="studio"
      locale={locale}
      initialTheme={initialTheme}
      setThemeFn={setThemeFn}
      includeToaster={false}
    >
      <AssetUploadSessionProvider>
        {children}
        <StudioOverlayHost />
      </AssetUploadSessionProvider>
    </CoreProviders>
  )
}
