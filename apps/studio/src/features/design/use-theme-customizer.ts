import { buildFontFamilyCss, normalizeThemeFonts } from '@valguide/core/features/themes/fonts'
import type { Theme } from '@valguide/core/features/themes/schema'
import { useCallback, useRef, useState } from 'react'
import { defaultFonts, defaultRadius, themeColorPresets } from './theme-presets'
import type { EditorThemeConfig, ThemeColors, ThemeFonts, ThemePreset } from './types'

function createPresetConfig(preset: ThemePreset, isDirty = false): EditorThemeConfig {
  return {
    basePreset: preset,
    colors: themeColorPresets[preset],
    radius: defaultRadius,
    fonts: defaultFonts,
    id: undefined,
    name: undefined,
    isDirty,
  }
}

function createThemeConfig(theme: Theme): EditorThemeConfig {
  return {
    basePreset: theme.basePreset,
    colors: theme.colors,
    radius: Number(theme.radius),
    fonts: { primary: normalizeThemeFonts(theme.fonts).primary },
    id: theme.id,
    name: theme.name,
    isDirty: false,
  }
}

function createOriginalConfig(input: Theme | ThemePreset): EditorThemeConfig {
  return typeof input === 'string' ? createPresetConfig(input) : createThemeConfig(input)
}

export function useThemeCustomizer(initialThemeOrPreset: Theme | ThemePreset = 'light') {
  const [config, setConfig] = useState<EditorThemeConfig>(() => createOriginalConfig(initialThemeOrPreset))
  const originalConfigRef = useRef<EditorThemeConfig>(createOriginalConfig(initialThemeOrPreset))

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

  const reset = useCallback(() => {
    setConfig({
      ...originalConfigRef.current,
      isDirty: false,
    })
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
      const newConfig: EditorThemeConfig = { basePreset, colors, radius, fonts, id, name, isDirty: false }
      setConfig(newConfig)
      originalConfigRef.current = newConfig
    },
    [],
  )

  const loadTheme = useCallback(
    (theme: Theme) => {
      const themeConfig = createThemeConfig(theme)
      loadThemeConfig(themeConfig)
    },
    [loadThemeConfig],
  )

  const loadDraftThemeConfig = useCallback(
    ({
      name,
      basePreset,
      colors,
      radius,
      fonts,
    }: Pick<EditorThemeConfig, 'name' | 'basePreset' | 'colors' | 'radius' | 'fonts'>) => {
      const draftConfig: EditorThemeConfig = {
        id: undefined,
        name,
        basePreset,
        colors,
        radius,
        fonts,
        isDirty: false,
      }

      originalConfigRef.current = draftConfig
      setConfig({
        ...draftConfig,
        isDirty: true,
      })
    },
    [],
  )

  const startNewTheme = useCallback((preset: ThemePreset, options?: { isDirty?: boolean }) => {
    originalConfigRef.current = createPresetConfig(preset)
    setConfig(createPresetConfig(preset, options?.isDirty ?? false))
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
    const { colors, radius } = config
    const primaryFont = buildFontFamilyCss(normalizeThemeFonts(config.fonts).primary)

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
      '--font-heading': primaryFont,
      '--font-body': primaryFont,
      '--font-caption': primaryFont,
    }
  }, [config])

  const getThemeData = useCallback(() => {
    const normalizedFonts = normalizeThemeFonts(config.fonts)
    return {
      basePreset: config.basePreset,
      colors: config.colors,
      radius: config.radius,
      fonts: { primary: normalizedFonts.primary },
    }
  }, [config])

  return {
    config,
    setPreset,
    setColor,
    setRadius,
    setFonts,
    reset,
    loadThemeConfig,
    loadTheme,
    loadDraftThemeConfig,
    startNewTheme,
    markClean,
    setThemeMetadata,
    getCSSVariables,
    getThemeData,
  }
}

export type UseThemeCustomizerReturn = ReturnType<typeof useThemeCustomizer>
