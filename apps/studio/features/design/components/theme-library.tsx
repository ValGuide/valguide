'use client'

import type { Theme } from '@valguide/core/features/themes/schema'
import { themeColorPresets } from '@valguide/core/features/themes/presets'
import { themePresets, type ThemePreset } from '@valguide/core/features/themes/types'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ThemeLibraryCard } from './theme-library-card'

export interface ThemeLibraryProps {
  themes: Theme[]
  isLoading: boolean
  selectedThemeId?: string
  onSelectTheme: (theme: Theme) => void
  onStartFromPreset: (preset: ThemePreset) => void
  onDeleteTheme: (theme: Theme) => void
  className?: string
}

export function ThemeLibrary({
  themes,
  isLoading,
  selectedThemeId,
  onSelectTheme,
  onStartFromPreset,
  onDeleteTheme,
  className,
}: ThemeLibraryProps) {
  const t = useTranslations('studio.themeCustomizer.themeLibrary')

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('title')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onStartFromPreset('light')}
          >
            <Plus className="size-4" />
            {t('newTheme')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[280px] px-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : themes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t('noThemes')}</p>
          ) : (
            <div className="space-y-2 pb-4">
              {themes.map((theme) => (
                <ThemeLibraryCard
                  key={theme.id}
                  theme={theme}
                  isSelected={theme.id === selectedThemeId}
                  onSelect={() => onSelectTheme(theme)}
                  onDelete={() => onDeleteTheme(theme)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2">{t('presets')}</p>
          <div className="flex flex-wrap gap-1.5">
            {themePresets.map((preset) => {
              const colors = themeColorPresets[preset]
              const label = preset.charAt(0).toUpperCase() + preset.slice(1).replace('-', ' ')
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onStartFromPreset(preset)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border hover:bg-accent transition-colors"
                  title={label}
                >
                  <div
                    className="size-3 rounded-full border"
                    style={{ backgroundColor: colors.primary }}
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
