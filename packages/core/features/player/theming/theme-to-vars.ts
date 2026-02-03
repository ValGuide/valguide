import type { ThemeColors, ThemeConfig, ThemeFont } from '../../themes/types'

/**
 * Convert a ThemeFont to a CSS font-family string.
 */
function fontToCSS(font: ThemeFont): string {
  const fallback = font.fallback ?? 'system-ui, sans-serif'
  return `${font.family}, ${fallback}`
}

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
  vars['--font-primary'] = fontToCSS(theme.fonts.primary)
  if (theme.fonts.overrides?.heading) {
    vars['--font-heading'] = fontToCSS(theme.fonts.overrides.heading)
  }
  if (theme.fonts.overrides?.body) {
    vars['--font-body'] = fontToCSS(theme.fonts.overrides.body)
  }
  if (theme.fonts.overrides?.caption) {
    vars['--font-caption'] = fontToCSS(theme.fonts.overrides.caption)
  }

  return vars
}
