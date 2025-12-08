'use client'

import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { type Theme, themes } from '@valguide/ui/theme/themes'
import { themePresets } from '../theme-presets'

function formatThemeName(themeName: string): string {
  return themeName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export interface ThemeSelectorProps {
  value: Theme | 'custom'
  onValueChange: (theme: Theme) => void
}

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Theme Preset</Label>
      <Select value={value === 'custom' ? undefined : value} onValueChange={(v) => onValueChange(v as Theme)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={value === 'custom' ? 'Custom' : formatThemeName(value)} />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => {
            const preset = themePresets[theme]
            return (
              <SelectItem key={theme} value={theme}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full border shrink-0"
                    style={{
                      backgroundColor: preset.primary,
                      borderColor: preset.border,
                    }}
                  />
                  {formatThemeName(theme)}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
