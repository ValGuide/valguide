import { createContext, type PropsWithChildren, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { defaultThemes } from '../themes/defaults'
import type { ThemePreset } from '../themes/types'
import type { Theme } from './types'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ThemePreset
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps extends PropsWithChildren {
  initialTheme: Theme
  setThemeFn: (args: { data: Theme }) => Promise<Theme>
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveThemePreset(theme: Theme): ThemePreset {
  if (theme === 'system') {
    return getSystemPreference() === 'dark' ? defaultThemes.dark : defaultThemes.light
  }
  if (theme === 'light') {
    return defaultThemes.light
  }
  if (theme === 'dark') {
    return defaultThemes.dark
  }
  return theme as ThemePreset
}

function applyTheme(resolvedTheme: ThemePreset) {
  document.documentElement.setAttribute('data-theme', resolvedTheme)
}

export function ThemeProvider({ children, initialTheme, setThemeFn }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ThemePreset>(() => resolveThemePreset(initialTheme))
  const isInitialMount = useRef(true)

  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme)
      const resolved = resolveThemePreset(newTheme)
      setResolvedTheme(resolved)
      applyTheme(resolved)
      await setThemeFn({ data: newTheme })
    },
    [setThemeFn],
  )

  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const resolved = getSystemPreference() === 'dark' ? defaultThemes.dark : defaultThemes.light
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      const domTheme = document.documentElement.getAttribute('data-theme') as ThemePreset | null
      if (domTheme && domTheme !== resolvedTheme) {
        setResolvedTheme(domTheme)
      }
      return
    }
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
