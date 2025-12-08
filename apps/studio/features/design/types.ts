import type { Theme } from '@valguide/ui/theme/themes'

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

export interface ThemeConfig {
  theme: Theme | 'custom'
  colors: ThemeColors
  radius: number
}

export type RadiusOption = 0 | 0.5 | 1.5 | 2

export const radiusOptions: RadiusOption[] = [0, 0.5, 1.5, 2]

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
