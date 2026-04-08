import { themeColorPresets } from '@valguide/core/features/themes/presets'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { formatThemePresetLabel, themePresets } from '../theme-display'

export interface ThemePresetChipsProps {
  value: ThemePreset
  onSelect: (preset: ThemePreset) => void
  limit?: number
  className?: string
}

export function ThemePresetChips({ value, onSelect, limit, className }: ThemePresetChipsProps) {
  const t = useTranslations('studio.themeCustomizer')
  const presets = limit ? themePresets.slice(0, limit) : themePresets

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-muted-foreground">{t('startFromPreset')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {presets.map((preset) => {
          const colors = themeColorPresets[preset]
          const isSelected = preset === value
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelect(preset)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all',
                'hover:border-primary/30 hover:bg-accent/40',
                isSelected && 'border-primary bg-accent/40 ring-2 ring-primary/20',
              )}
            >
              <div className="mb-3 flex gap-1">
                {[colors.background, colors.primary, colors.accent].map((color) => (
                  <div
                    key={`${preset}-${color}`}
                    className="h-8 flex-1 rounded-md border border-border/70 shadow-xs"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{formatThemePresetLabel(preset)}</span>
                {isSelected ? <span className="text-xs text-primary">{t('themeLibrary.selectedBadge')}</span> : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
