export {
  backgroundColorKeys,
  colorVariableLabels,
  otherColorKeys,
  primaryColorKeys,
  themePresets,
  type ThemeColors,
  type ThemeConfig,
  type ThemeFonts,
  type ThemePreset,
} from '@valguide/core/features/themes/types'

export type RadiusOption = 0 | 0.5 | 1.5 | 2

export const radiusOptions: RadiusOption[] = [0, 0.5, 1.5, 2]

export interface EditorThemeConfig {
  basePreset: import('@valguide/core/features/themes/types').ThemePreset
  colors: import('@valguide/core/features/themes/types').ThemeColors
  radius: number
  fonts: import('@valguide/core/features/themes/types').ThemeFonts
  id?: string
  name?: string
  isDirty?: boolean
}
