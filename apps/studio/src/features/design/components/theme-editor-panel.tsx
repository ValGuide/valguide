import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Separator } from '@valguide/ui/components/separator'
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
  const currentThemeLabel =
    config.name ??
    config.basePreset
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

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
          'space-y-4 border-b',
          isMobileLayout ? 'px-4 py-4' : isWorkspaceLayout ? 'px-6 py-5 sm:px-8' : 'px-6 py-4',
        )}
      >
        <div
          className={cn(
            'flex min-w-0 gap-3',
            isMobileLayout
              ? 'flex-col'
              : isWorkspaceLayout
                ? 'flex-col sm:flex-row sm:items-start sm:justify-between'
                : 'flex-col items-start 2xl:flex-row 2xl:items-center 2xl:justify-between',
          )}
        >
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            <p className="mt-1 break-words text-sm leading-tight text-muted-foreground">
              {t('editor.editing', { name: currentThemeLabel })}
            </p>
          </div>
          <div
            className={cn('flex shrink-0 flex-wrap items-center gap-2 self-start', !isMobileLayout && '2xl:self-auto')}
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
        </div>

        {config.isDirty && <p className="text-xs text-amber-600 dark:text-amber-500">{t('editor.unsavedChanges')}</p>}

        <ThemePresetChips value={config.basePreset} onSelect={onStartFromPreset} />
      </CardHeader>

      <CardContent className={cn('min-h-0 flex-1 p-0', isMobileLayout && 'overflow-hidden')}>
        <div
          className={cn(
            'space-y-5 pb-6',
            isMobileLayout ? 'h-full overflow-y-auto px-4 pt-4' : isWorkspaceLayout ? 'px-6 pt-5 sm:px-8' : 'px-6 pt-4',
          )}
        >
          <SavedThemesList
            themes={themes}
            isLoading={isLoading}
            selectedThemeId={config.id}
            onSelectTheme={onSelectTheme}
            onDeleteTheme={onDeleteTheme}
            showDelete={showDeleteThemes}
          />

          {themes.length > 0 && <Separator />}

          <div className="space-y-2">
            <ColorGroup
              title={t('brandBasics')}
              colorKeys={brandBasicsColorKeys}
              colors={config.colors}
              onColorChange={handleColorChange}
              defaultOpen
            />
            <p className="text-xs text-muted-foreground">{t('brandBasicsHint')}</p>
          </div>

          <Separator />

          <div className="space-y-4">
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
