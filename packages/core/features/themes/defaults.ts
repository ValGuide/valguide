import { defaultFonts, defaultRadius, themeColorPresets } from './presets'
import type { ThemeConfig } from './types'

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  basePreset: 'light',
  colors: themeColorPresets.light,
  radius: defaultRadius,
  fonts: defaultFonts,
}

export function getCSSVariablesFromTheme(config: ThemeConfig): Record<string, string> {
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
}
