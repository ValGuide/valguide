import type { Theme } from '@valguide/core/features/themes/schema'
import { useCallback, useRef, useState } from 'react'
import { defaultFonts, defaultRadius, themeColorPresets } from './theme-presets'
import type { EditorThemeConfig, ThemeColors, ThemeFonts, ThemePreset } from './types'

export function useThemeCustomizer(initialPreset: ThemePreset = 'light') {
  const [config, setConfig] = useState<EditorThemeConfig>({
    basePreset: initialPreset,
    colors: themeColorPresets[initialPreset],
    radius: defaultRadius,
    fonts: defaultFonts,
    id: undefined,
    name: undefined,
    isDirty: false,
  })

  const originalConfigRef = useRef<EditorThemeConfig | null>(null)

  const setPreset = useCallback((preset: ThemePreset) => {
    setConfig((prev) => ({
      ...prev,
      basePreset: preset,
      colors: themeColorPresets[preset],
      isDirty: true,
    }))
  }, [])

  const setColor = useCallback((key: keyof ThemeColors, value: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
      isDirty: true,
    }))
  }, [])

  const setRadius = useCallback((radius: number) => {
    setConfig((prev) => ({
      ...prev,
      radius,
      isDirty: true,
    }))
  }, [])

  const setFonts = useCallback((fonts: ThemeFonts) => {
    setConfig((prev) => ({
      ...prev,
      fonts,
      isDirty: true,
    }))
  }, [])

  const resetToPreset = useCallback((preset: ThemePreset) => {
    setConfig({
      basePreset: preset,
      colors: themeColorPresets[preset],
      radius: defaultRadius,
      fonts: defaultFonts,
      id: undefined,
      name: undefined,
      isDirty: false,
    })
    originalConfigRef.current = null
  }, [])

  const loadThemeConfig = useCallback(
    ({
      id,
      name,
      basePreset,
      colors,
      radius,
      fonts,
    }: Pick<EditorThemeConfig, 'id' | 'name' | 'basePreset' | 'colors' | 'radius' | 'fonts'>) => {
      const newConfig: EditorThemeConfig = {
        basePreset,
        colors,
        radius,
        fonts,
        id,
        name,
        isDirty: false,
      }
      setConfig(newConfig)
      originalConfigRef.current = newConfig
    },
    [],
  )

  const loadTheme = useCallback(
    (theme: Theme) => {
      loadThemeConfig({
        basePreset: theme.basePreset,
        colors: theme.colors,
        radius: Number(theme.radius),
        fonts: theme.fonts,
        id: theme.id,
        name: theme.name,
      })
    },
    [loadThemeConfig],
  )

  const startNewTheme = useCallback((preset: ThemePreset) => {
    setConfig({
      basePreset: preset,
      colors: themeColorPresets[preset],
      radius: defaultRadius,
      fonts: defaultFonts,
      id: undefined,
      name: undefined,
      isDirty: false,
    })
    originalConfigRef.current = null
  }, [])

  const markClean = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      isDirty: false,
    }))
  }, [])

  const setThemeMetadata = useCallback((id: string, name: string) => {
    setConfig((prev) => ({
      ...prev,
      id,
      name,
    }))
  }, [])

  const getCSSVariables = useCallback((): Record<string, string> => {
    const { colors, radius, fonts } = config

    const primaryFont = `"${fonts.primary.family}", ${fonts.primary.fallback ?? 'sans-serif'}`
    const headingFont = fonts.overrides?.heading
      ? `"${fonts.overrides.heading.family}", ${fonts.overrides.heading.fallback ?? 'sans-serif'}`
      : primaryFont
    const bodyFont = fonts.overrides?.body
      ? `"${fonts.overrides.body.family}", ${fonts.overrides.body.fallback ?? 'sans-serif'}`
      : primaryFont
    const captionFont = fonts.overrides?.caption
      ? `"${fonts.overrides.caption.family}", ${fonts.overrides.caption.fallback ?? 'sans-serif'}`
      : primaryFont

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
      '--font-primary': primaryFont,
      '--font-heading': headingFont,
      '--font-body': bodyFont,
      '--font-caption': captionFont,
    }
  }, [config])

  const getThemeData = useCallback(() => {
    return {
      basePreset: config.basePreset,
      colors: config.colors,
      radius: config.radius,
      fonts: config.fonts,
    }
  }, [config])

  return {
    config,
    setPreset,
    setColor,
    setRadius,
    setFonts,
    resetToPreset,
    loadThemeConfig,
    loadTheme,
    startNewTheme,
    markClean,
    setThemeMetadata,
    getCSSVariables,
    getThemeData,
  }
}

export type UseThemeCustomizerReturn = ReturnType<typeof useThemeCustomizer>
