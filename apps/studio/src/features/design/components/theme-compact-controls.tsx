import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@valguide/ui/components/drawer'
import { Separator } from '@valguide/ui/components/separator'
import { cn } from '@valguide/ui/lib/utils'
import { Layers2, Palette, RotateCcw, Save, SlidersHorizontal, SwatchBook } from 'lucide-react'
import { useMemo, useState } from 'react'
import { backgroundColorKeys, otherColorKeys, primaryColorKeys, type ThemeColors } from '../types'
import type { UseThemeCustomizerReturn } from '../use-theme-customizer'
import { ColorGroup } from './color-group'
import { RadiusSelector } from './radius-selector'
import { SavedThemesList } from './saved-themes-list'
import { ThemePresetChips } from './theme-preset-chips'

type CompactPanel = 'themes' | 'radius' | 'colors' | null

export interface ThemeCompactControlsProps {
  customizer: UseThemeCustomizerReturn
  themes: Theme[]
  isLoading: boolean
  onSelectTheme: (theme: Theme) => void
  onStartFromPreset: (preset: ThemePreset) => void
  onDeleteTheme: (theme: Theme) => void
  onSave: () => void
  className?: string
}

export function ThemeCompactControls({
  customizer,
  themes,
  isLoading,
  onSelectTheme,
  onStartFromPreset,
  onDeleteTheme,
  onSave,
  className,
}: ThemeCompactControlsProps) {
  const t = useTranslations('studio.themeCustomizer')
  const [activePanel, setActivePanel] = useState<CompactPanel>(null)
  const { config, setColor, setRadius, resetToPreset } = customizer

  const currentThemeLabel = useMemo(
    () =>
      config.name ??
      config.basePreset
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    [config.basePreset, config.name],
  )

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColor(key, value)
  }

  const handleReset = () => {
    resetToPreset(config.basePreset)
  }

  const panelTitle =
    activePanel === 'themes'
      ? t('compactControls.themes')
      : activePanel === 'radius'
        ? t('radius')
        : activePanel === 'colors'
          ? t('compactControls.colors')
          : ''

  return (
    <>
      <div
        className={cn(
          'sticky bottom-0 z-20 rounded-t-2xl border border-b-0 bg-background/95 p-3 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/88',
          className,
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentThemeLabel}</p>
            {config.isDirty ? (
              <p className="text-xs text-amber-600 dark:text-amber-500">{t('editor.unsavedChanges')}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t('compactControls.ready')}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="size-3.5" />
              <span>{t('reset')}</span>
            </Button>
            <Button size="sm" onClick={onSave} className="gap-1.5">
              <Save className="size-3.5" />
              <span>{t('editor.saveTheme')}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePanel('themes')}>
            <Layers2 className="size-4" />
            <span>{t('compactControls.themes')}</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePanel('radius')}>
            <SlidersHorizontal className="size-4" />
            <span>{t('radius')}</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePanel('colors')}>
            <Palette className="size-4" />
            <span>{t('compactControls.colors')}</span>
          </Button>
        </div>
      </div>

      <Drawer open={activePanel !== null} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DrawerContent className="!h-[min(82dvh,46rem)] !max-h-[82dvh] rounded-t-[1.25rem]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{panelTitle}</DrawerTitle>
            <DrawerDescription className="sr-only">{panelTitle}</DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {activePanel === 'themes' ? (
              <div className="space-y-5">
                <ThemePresetChips value={config.basePreset} onSelect={onStartFromPreset} />
                {themes.length > 0 ? (
                  <>
                    <Separator />
                    <SavedThemesList
                      themes={themes}
                      isLoading={isLoading}
                      selectedThemeId={config.id}
                      onSelectTheme={(theme) => {
                        onSelectTheme(theme)
                        setActivePanel(null)
                      }}
                      onDeleteTheme={onDeleteTheme}
                    />
                  </>
                ) : null}
              </div>
            ) : null}

            {activePanel === 'radius' ? <RadiusSelector value={config.radius} onValueChange={setRadius} /> : null}

            {activePanel === 'colors' ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <SwatchBook className="size-4" />
                    <span>{t('compactControls.colorSummary')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      config.colors.primary,
                      config.colors.secondary,
                      config.colors.accent,
                      config.colors.background,
                    ].map((color) => (
                      <div
                        key={color}
                        className="size-8 rounded-md border border-border/70 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

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
                  defaultOpen
                />
                <ColorGroup
                  title={t('otherColors')}
                  colorKeys={otherColorKeys}
                  colors={config.colors}
                  onColorChange={handleColorChange}
                  defaultOpen
                />
              </div>
            ) : null}
          </div>

          <DrawerFooter className="border-t bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button variant="outline" onClick={() => setActivePanel(null)}>
              {t('saveDialog.cancel')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
