import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ThemeConfig } from '../../themes/types'
import { themeToVars } from './theme-to-vars'

type TourThemeProviderProps = {
  initialTheme: ThemeConfig | null
  children: React.ReactNode
  enablePreview?: boolean
  allowedOrigins?: string[]
}

const TourThemePortalContainerContext = createContext<HTMLElement | null>(null)
type PreviewMessage = { type: 'valguide.preview.theme'; theme: ThemeConfig } | { type: 'valguide.preview.theme.reset' }

/**
 * Provider that applies tour-specific theme CSS variables.
 * Supports live theme updates via postMessage for studio preview.
 */
export function TourThemeProvider({
  initialTheme,
  children,
  enablePreview = false,
  allowedOrigins = [],
}: TourThemeProviderProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [theme, setTheme] = useState<ThemeConfig | null>(initialTheme)

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!enablePreview) return
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) return

      const data = event.data as PreviewMessage
      if (!data || typeof data !== 'object' || !('type' in data)) return

      if (data.type === 'valguide.preview.theme' && 'theme' in data) {
        setTheme(data.theme)
      } else if (data.type === 'valguide.preview.theme.reset') {
        setTheme(initialTheme)
      }
    },
    [enablePreview, allowedOrigins, initialTheme],
  )

  useEffect(() => {
    setTheme(initialTheme)
  }, [initialTheme])

  useEffect(() => {
    if (!enablePreview) return

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [enablePreview, handleMessage])

  const themeVars = useMemo(() => {
    if (!theme) return undefined
    return themeToVars(theme)
  }, [theme])

  return (
    <TourThemePortalContainerContext.Provider value={portalContainer}>
      <div
        ref={setPortalContainer}
        style={themeVars as React.CSSProperties}
        data-tour-theme
        className="min-h-dvh bg-background text-foreground"
      >
        {children}
      </div>
    </TourThemePortalContainerContext.Provider>
  )
}

export function useTourThemePortalContainer() {
  return useContext(TourThemePortalContainerContext)
}
