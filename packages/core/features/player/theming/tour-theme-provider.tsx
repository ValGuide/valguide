import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ThemeConfig } from '../../themes/types'
import { themeToVars } from './theme-to-vars'

type TourThemeProviderProps = {
  initialTheme: ThemeConfig | null
  children: React.ReactNode
  enablePreview?: boolean
  allowedOrigins?: string[]
}

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
    if (!enablePreview) return

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [enablePreview, handleMessage])

  const themeVars = useMemo(() => {
    if (!theme) return undefined
    return themeToVars(theme)
  }, [theme])

  return (
    <div style={themeVars as React.CSSProperties} className="min-h-dvh bg-background text-foreground">
      {children}
    </div>
  )
}
