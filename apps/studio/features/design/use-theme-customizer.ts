'use client'

import type { Theme } from '@valguide/ui/theme/themes'
import { useCallback, useState } from 'react'
import { defaultRadius, themePresets } from './theme-presets'
import type { ThemeColors, ThemeConfig } from './types'

export function useThemeCustomizer(initialTheme: Theme = 'light') {
  const [config, setConfig] = useState<ThemeConfig>({
    theme: initialTheme,
    colors: themePresets[initialTheme],
    radius: defaultRadius,
  })

  const setTheme = useCallback((theme: Theme) => {
    setConfig((prev) => ({
      ...prev,
      theme,
      colors: themePresets[theme],
    }))
  }, [])

  const setColor = useCallback((key: keyof ThemeColors, value: string) => {
    setConfig((prev) => ({
      ...prev,
      theme: 'custom',
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }))
  }, [])

  const setRadius = useCallback((radius: number) => {
    setConfig((prev) => ({
      ...prev,
      radius,
    }))
  }, [])

  const resetToTheme = useCallback((theme: Theme) => {
    setConfig({
      theme,
      colors: themePresets[theme],
      radius: defaultRadius,
    })
  }, [])

  const getCSSVariables = useCallback((): Record<string, string> => {
    const { colors, radius } = config
    return {
      '--background': colors.background,
      '--foreground': colors.foreground,
      '--card': colors.card,
      '--card-foreground': colors.cardForeground,
      '--popover': colors.popover,
      '--popover-foreground': colors.popoverForeground,
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--secondary': colors.secondary,
      '--secondary-foreground': colors.secondaryForeground,
      '--muted': colors.muted,
      '--muted-foreground': colors.mutedForeground,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--destructive': colors.destructive,
      '--destructive-foreground': colors.destructiveForeground,
      '--border': colors.border,
      '--input': colors.input,
      '--ring': colors.ring,
      '--radius': `${radius}rem`,
    }
  }, [config])

  return {
    config,
    setTheme,
    setColor,
    setRadius,
    resetToTheme,
    getCSSVariables,
  }
}

export type UseThemeCustomizerReturn = ReturnType<typeof useThemeCustomizer>
