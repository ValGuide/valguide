import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'

export {
  colorVariableLabels,
  type ThemeColors,
  type ThemeConfig,
  type ThemeFonts,
  type ThemePreset,
  themePresets,
} from '@valguide/core/features/themes/types'

export type RadiusOption = 0 | 0.5 | 1.5 | 2

export const radiusOptions: RadiusOption[] = [0, 0.5, 1.5, 2]

export interface EditorThemeConfig {
  basePreset: ThemePreset
  colors: ThemeColors
  radius: number
  fonts: ThemeFonts
  id?: string
  name?: string
  isDirty?: boolean
}
