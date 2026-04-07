import { buildFontFamilyCss, normalizeThemeFonts } from '../../themes/fonts'
import type { ThemeColors, ThemeConfig } from '../../themes/types'

/**
 * CSS variable name mapping for color keys.
 */
const colorVariableMap: Record<keyof ThemeColors, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
}

/**
 * Convert a ThemeConfig to CSS custom properties.
 * Returns an object that can be spread onto a React style prop.
 */
export function themeToVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {}
  const normalizedFonts = normalizeThemeFonts(theme.fonts)
  const primaryFont = buildFontFamilyCss(normalizedFonts.primary)

  // Apply colors
  for (const [key, cssVar] of Object.entries(colorVariableMap)) {
    const colorValue = theme.colors[key as keyof ThemeColors]
    if (colorValue) {
      vars[cssVar] = colorValue
    }
  }

  // Apply radius
  vars['--radius'] = `${theme.radius}rem`

  // Apply fonts
  vars['--font-primary'] = primaryFont
  vars['--font-heading'] = primaryFont
  vars['--font-body'] = primaryFont
  vars['--font-caption'] = primaryFont

  return vars
}
