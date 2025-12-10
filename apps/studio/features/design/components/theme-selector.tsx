'use client'

import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { useTranslations } from 'next-intl'
import { type ThemePreset, themeColorPresets, themePresets } from '../theme-presets'

function formatThemeName(themeName: string): string {
  return themeName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export interface ThemeSelectorProps {
  value: ThemePreset
  onValueChange: (preset: ThemePreset) => void
}

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  const t = useTranslations('studio.themeCustomizer')

  return (
    <div className="space-y-2">
      <Label>{t('themePreset')}</Label>
      <Select value={value} onValueChange={(v) => onValueChange(v as ThemePreset)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={formatThemeName(value)} />
        </SelectTrigger>
        <SelectContent>
          {themePresets.map((preset) => {
            const colors = themeColorPresets[preset]
            return (
              <SelectItem key={preset} value={preset}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full border shrink-0"
                    style={{
                      backgroundColor: colors.primary,
                      borderColor: colors.border,
                    }}
                  />
                  {formatThemeName(preset)}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
