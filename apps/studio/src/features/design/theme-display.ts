import { type ThemePreset, themePresets } from '@valguide/core/features/themes/types'

function formatThemePresetLabel(preset: ThemePreset): string {
  return preset
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export { formatThemePresetLabel, themePresets }
