import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { cn } from '@valguide/ui/lib/utils'
import { RotateCcw, Save } from 'lucide-react'
import type { ThemeColors } from '../types'
import type { UseThemeCustomizerReturn } from '../use-theme-customizer'
import { ColorGroup } from './color-group'
import { RadiusSelector } from './radius-selector'
import { SavedThemesList } from './saved-themes-list'
import { ThemePresetChips } from './theme-preset-chips'

const brandBasicsColorKeys: (keyof ThemeColors)[] = ['primary', 'primaryForeground', 'background', 'foreground']
const supportingColorKeys: (keyof ThemeColors)[] = ['secondary', 'secondaryForeground', 'accent', 'accentForeground']
const surfaceColorKeys: (keyof ThemeColors)[] = ['card', 'cardForeground', 'muted', 'mutedForeground']
const interfaceColorKeys: (keyof ThemeColors)[] = [
  'popover',
  'popoverForeground',
  'destructive',
  'destructiveForeground',
  'border',
  'input',
  'ring',
]

export interface ThemeEditorPanelProps {
  customizer: UseThemeCustomizerReturn
  themes: Theme[]
  isLoading: boolean
  onSelectTheme: (theme: Theme) => void
  onStartFromPreset: (preset: ThemePreset) => void
  onDeleteTheme?: (theme: Theme) => void
  onSave: () => void
  showDeleteThemes?: boolean
  layout?: 'workspace' | 'split' | 'mobile'
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
  showDeleteThemes = true,
  layout = 'split',
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

  const isWorkspaceLayout = layout === 'workspace'
  const isMobileLayout = layout === 'mobile'

  return (
    <Card
      className={cn(
        'flex min-h-0 min-w-0 w-full flex-col overflow-hidden',
        (isWorkspaceLayout || isMobileLayout) && 'shadow-sm',
        className,
      )}
    >
      <CardHeader
        className={cn(
          'space-y-4',
          isMobileLayout ? 'px-4 py-4' : isWorkspaceLayout ? 'px-6 py-5 sm:px-8' : 'px-6 py-4',
        )}
      >
        {isMobileLayout ? (
          <CardTitle className="sr-only">{t('title')}</CardTitle>
        ) : (
          <div className="flex w-full min-w-0 items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="size-3.5" />
                <span>{t('reset')}</span>
              </Button>
              <Button variant="default" size="sm" onClick={onSave} className="gap-1.5">
                <Save className="size-3.5" />
                <span>{t('editor.saveTheme')}</span>
              </Button>
            </div>
          </div>
        )}
        <div
          className={cn(
            'flex w-full shrink-0 flex-wrap items-center justify-end gap-2',
            isMobileLayout ? 'justify-stretch' : 'hidden',
          )}
        >
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            <span>{t('reset')}</span>
          </Button>
          <Button variant="default" size="sm" onClick={onSave} className="gap-1.5">
            <Save className="size-3.5" />
            <span>{t('editor.saveTheme')}</span>
          </Button>
        </div>

        {config.isDirty && <p className="text-xs text-amber-600 dark:text-amber-500">{t('editor.unsavedChanges')}</p>}

        <ThemePresetChips value={config.basePreset} onSelect={onStartFromPreset} />
      </CardHeader>

      <CardContent className={cn('min-h-0 flex-1 p-0', isMobileLayout && 'overflow-hidden')}>
        <div
          className={cn(
            'space-y-0 pb-6',
            isMobileLayout ? 'h-full overflow-y-auto px-4 pt-2' : isWorkspaceLayout ? 'px-6 pt-2 sm:px-8' : 'px-6 pt-2',
          )}
        >
          <div className="space-y-3 border-t border-border/70 pt-5 first:border-t-0 first:pt-0">
            <SavedThemesList
              themes={themes}
              isLoading={isLoading}
              selectedThemeId={config.id}
              onSelectTheme={onSelectTheme}
              onDeleteTheme={onDeleteTheme}
              showDelete={showDeleteThemes}
            />
          </div>

          <div className="space-y-3 border-t border-border/70 pt-5">
            <ColorGroup
              title={t('brandBasics')}
              colorKeys={brandBasicsColorKeys}
              colors={config.colors}
              onColorChange={handleColorChange}
              defaultOpen
            />
            <p className="text-xs text-muted-foreground">{t('brandBasicsHint')}</p>
          </div>

          <div className="space-y-4 border-t border-border/70 pt-5">
            <RadiusSelector value={config.radius} onValueChange={setRadius} />
            <ColorGroup
              title={t('supportingColors')}
              colorKeys={supportingColorKeys}
              colors={config.colors}
              onColorChange={handleColorChange}
            />
            <ColorGroup
              title={t('surfaceColors')}
              colorKeys={surfaceColorKeys}
              colors={config.colors}
              onColorChange={handleColorChange}
            />
            <ColorGroup
              title={t('interfaceColors')}
              colorKeys={interfaceColorKeys}
              colors={config.colors}
              onColorChange={handleColorChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
