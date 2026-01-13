export const themePresets = [
  'light',
  'dark',
  'blue',
  'blue-dark',
  'green',
  'green-dark',
  'purple',
  'purple-dark',
  'sage',
  'sage-dark',
  'stone',
  'stone-dark',
  'lavender',
  'lavender-dark',
  'sand',
  'sand-dark',
  'gallery',
  'gallery-dark',
] as const

export type ThemePreset = (typeof themePresets)[number]

export const fontSources = ['system', 'google', 'custom'] as const

export type FontSource = (typeof fontSources)[number]

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

export interface ThemeFont {
  source: FontSource
  family: string
  fallback?: string
}

export interface ThemeFonts {
  primary: ThemeFont
  overrides?: {
    heading?: ThemeFont
    body?: ThemeFont
    caption?: ThemeFont
  }
}

export interface ThemeConfig {
  basePreset: ThemePreset
  colors: ThemeColors
  radius: number
  fonts: ThemeFonts
}

export const colorVariableLabels: Record<keyof ThemeColors, string> = {
  background: 'Background',
  foreground: 'Foreground',
  card: 'Card',
  cardForeground: 'Card Foreground',
  popover: 'Popover',
  popoverForeground: 'Popover Foreground',
  primary: 'Primary',
  primaryForeground: 'Primary Foreground',
  secondary: 'Secondary',
  secondaryForeground: 'Secondary Foreground',
  muted: 'Muted',
  mutedForeground: 'Muted Foreground',
  accent: 'Accent',
  accentForeground: 'Accent Foreground',
  destructive: 'Destructive',
  destructiveForeground: 'Destructive Foreground',
  border: 'Border',
  input: 'Input',
  ring: 'Ring',
}

export const primaryColorKeys: (keyof ThemeColors)[] = [
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'accentForeground',
]

export const backgroundColorKeys: (keyof ThemeColors)[] = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'muted',
  'mutedForeground',
]

export const otherColorKeys: (keyof ThemeColors)[] = [
  'popover',
  'popoverForeground',
  'destructive',
  'destructiveForeground',
  'border',
  'input',
  'ring',
]
