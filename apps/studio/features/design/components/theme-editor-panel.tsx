'use client'

import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Separator } from '@valguide/ui/components/separator'
import { cn } from '@valguide/ui/lib/utils'
import { RotateCcw, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { backgroundColorKeys, otherColorKeys, primaryColorKeys, type ThemeColors } from '../types'
import type { UseThemeCustomizerReturn } from '../use-theme-customizer'
import { ColorGroup } from './color-group'
import { RadiusSelector } from './radius-selector'
import { SavedThemesList } from './saved-themes-list'
import { ThemePresetChips } from './theme-preset-chips'

export interface ThemeEditorPanelProps {
  customizer: UseThemeCustomizerReturn
  themes: Theme[]
  isLoading: boolean
  onSelectTheme: (theme: Theme) => void
  onStartFromPreset: (preset: ThemePreset) => void
  onDeleteTheme: (theme: Theme) => void
  onSave: () => void
  className?: string
}

export function ThemeEditorPanel({
  customizer,
  themes,
  isLoading,
  onSelectTheme,
  onStartFromPreset,
  onDeleteTheme,
  onSave,
  className,
}: ThemeEditorPanelProps) {
  const t = useTranslations('studio.themeCustomizer')
  const { config, setColor, setRadius, resetToPreset } = customizer

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColor(key, value)
  }

  const handleReset = () => {
    resetToPreset(config.basePreset)
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            {config.name && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {t('editor.editing', { name: config.name })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">{t('reset')}</span>
            </Button>
            <Button variant="default" size="sm" onClick={onSave} className="gap-1.5">
              <Save className="size-3.5" />
              <span className="hidden sm:inline">{t('editor.saveTheme')}</span>
            </Button>
          </div>
        </div>

        {config.isDirty && <p className="text-xs text-amber-600 dark:text-amber-500">{t('editor.unsavedChanges')}</p>}

        <ThemePresetChips value={config.basePreset} onSelect={onStartFromPreset} />
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 px-6 pb-6">
            <SavedThemesList
              themes={themes}
              isLoading={isLoading}
              selectedThemeId={config.id}
              onSelectTheme={onSelectTheme}
              onDeleteTheme={onDeleteTheme}
            />

            {themes.length > 0 && <Separator />}

            <RadiusSelector value={config.radius} onValueChange={setRadius} />

            <Separator />

            <div className="space-y-1">
              <ColorGroup
                title={t('primaryColors')}
                colorKeys={primaryColorKeys}
                colors={config.colors}
                onColorChange={handleColorChange}
                defaultOpen
              />

              <ColorGroup
                title={t('backgroundColors')}
                colorKeys={backgroundColorKeys}
                colors={config.colors}
                onColorChange={handleColorChange}
              />

              <ColorGroup
                title={t('otherColors')}
                colorKeys={otherColorKeys}
                colors={config.colors}
                onColorChange={handleColorChange}
              />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
