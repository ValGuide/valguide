'use client'

import { themeColorPresets } from '@valguide/core/features/themes/presets'
import { themePresets, type ThemePreset } from '@valguide/core/features/themes/types'
import { cn } from '@valguide/ui/lib/utils'
import { useTranslations } from 'next-intl'

export interface ThemePresetChipsProps {
  value: ThemePreset
  onSelect: (preset: ThemePreset) => void
  className?: string
}

export function ThemePresetChips({ value, onSelect, className }: ThemePresetChipsProps) {
  const t = useTranslations('studio.themeCustomizer')

  const formatLabel = (preset: ThemePreset) => {
    return preset
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-muted-foreground">{t('startFromPreset')}</p>
      <div className="flex flex-wrap gap-1.5">
        {themePresets.map((preset) => {
          const colors = themeColorPresets[preset]
          const isSelected = preset === value
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelect(preset)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-all',
                'hover:bg-accent hover:border-accent-foreground/20',
                isSelected && 'ring-2 ring-primary ring-offset-1 bg-accent',
              )}
            >
              <div
                className="size-3 rounded-full border border-foreground/20"
                style={{ backgroundColor: colors.primary }}
              />
              {formatLabel(preset)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
