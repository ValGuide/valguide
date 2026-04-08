import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { ScrollArea, ScrollBar } from '@valguide/ui/components/scroll-area'
import { cn } from '@valguide/ui/lib/utils'
import { Palette, RotateCcw, Save, SlidersHorizontal, SwatchBook } from 'lucide-react'
import { useState } from 'react'
import { formatThemePresetLabel } from '../theme-display'
import type { ThemeColors } from '../types'
import type { UseThemeCustomizerReturn } from '../use-theme-customizer'
import { ColorGroup } from './color-group'
import { FontControls } from './font-controls'
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

type DockPanel = 'theme' | 'brand' | 'advanced' | null

export interface ThemeMobileDockProps {
  customizer: UseThemeCustomizerReturn
  themes: Theme[]
  defaultThemeId?: string | null
  canManageDefaultTheme?: boolean
  isLoading: boolean
  onSelectTheme: (theme: Theme) => void
  onStartFromPreset: (preset: ThemePreset) => void
  onDeleteTheme?: (theme: Theme) => void
  onSetDefaultTheme?: (theme: Theme) => Promise<void>
  onClearDefaultTheme?: () => Promise<void>
  onSave: () => void
  showDeleteThemes?: boolean
}

export function ThemeMobileDock({
  customizer,
  themes,
  defaultThemeId,
  canManageDefaultTheme = false,
  isLoading,
  onSelectTheme,
  onStartFromPreset,
  onDeleteTheme,
  onSetDefaultTheme,
  onClearDefaultTheme,
  onSave,
  showDeleteThemes = true,
}: ThemeMobileDockProps) {
  const t = useTranslations('studio.themeCustomizer')
  const { config, setColor, setRadius, setFonts, resetToPreset } = customizer
  const [activePanel, setActivePanel] = useState<DockPanel>(null)

  const currentThemeLabel = config.name ?? formatThemePresetLabel(config.basePreset)
  const currentThemeSwatches = [
    { key: 'background', color: config.colors.background },
    { key: 'primary', color: config.colors.primary },
    { key: 'accent', color: config.colors.accent },
  ]

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColor(key, value)
  }

  const closePanel = () => setActivePanel(null)

  const pickerContent = (
    <div className="space-y-4">
      <SavedThemesList
        themes={themes}
        isLoading={isLoading}
        selectedThemeId={config.id}
        defaultThemeId={defaultThemeId}
        canManageDefaultTheme={canManageDefaultTheme}
        onSelectTheme={(theme) => {
          onSelectTheme(theme)
          closePanel()
        }}
        onDeleteTheme={onDeleteTheme}
        onSetDefaultTheme={onSetDefaultTheme}
        onClearDefaultTheme={onClearDefaultTheme}
        showDelete={showDeleteThemes}
      />

      {themes.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t('themeLibrary.emptyTitle')}</p>
          <p className="mt-1">{t('themeLibrary.emptyDescription')}</p>
        </div>
      ) : null}

      <div className={cn(themes.length > 0 && 'border-t pt-4')}>
        <ThemePresetChips
          value={config.basePreset}
          onSelect={(preset) => {
            onStartFromPreset(preset)
            closePanel()
          }}
        />
      </div>
    </div>
  )

  const brandContent = (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SwatchBook className="size-4" />
          <span>{t('compactControls.brandSummary')}</span>
        </div>
        <div className="flex gap-2">
          {currentThemeSwatches.map((swatch) => (
            <div
              key={swatch.key}
              className="h-10 flex-1 rounded-md border border-border/70 shadow-xs"
              style={{ backgroundColor: swatch.color }}
            />
          ))}
        </div>
      </div>

      <ColorGroup
        title={t('brandBasics')}
        colorKeys={brandBasicsColorKeys}
        colors={config.colors}
        onColorChange={handleColorChange}
        defaultOpen
      />
      <FontControls fonts={config.fonts} onChange={setFonts} />
    </div>
  )

  const advancedContent = (
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
  )

  const dockItemClass =
    'flex min-w-[8.75rem] flex-col items-start gap-1 rounded-[1.05rem] border border-border/45 bg-background/28 px-3 py-2.5 text-left text-foreground/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition-colors hover:border-border/70 hover:bg-background/36'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:absolute md:inset-x-0 md:bottom-0 md:px-0 md:pb-0">
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-[1.45rem] border border-border/50 bg-background/72 p-2.5 shadow-[0_-18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/58 md:max-w-none md:rounded-[1.6rem] md:p-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <Popover open={activePanel === 'theme'} onOpenChange={(open) => setActivePanel(open ? 'theme' : null)}>
              <PopoverTrigger asChild>
                <button type="button" className={dockItemClass}>
                  <span className="text-xs text-muted-foreground">{t('compactControls.themes')}</span>
                  <span className="truncate text-sm font-medium">{currentThemeLabel}</span>
                  <div className="mt-1 flex w-full gap-1">
                    {currentThemeSwatches.map((swatch) => (
                      <div
                        key={swatch.key}
                        className="h-2.5 flex-1 rounded-full border border-border/50"
                        style={{ backgroundColor: swatch.color }}
                      />
                    ))}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                sideOffset={12}
                className="w-[min(34rem,calc(100vw-1.5rem))] rounded-[1.4rem] border-border/60 bg-background/90 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold">{t('chooseThemeTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('chooseThemeDescription')}</p>
                </div>
                <div className="max-h-[min(60dvh,34rem)] overflow-y-auto pr-1">{pickerContent}</div>
              </PopoverContent>
            </Popover>

            <Popover open={activePanel === 'brand'} onOpenChange={(open) => setActivePanel(open ? 'brand' : null)}>
              <PopoverTrigger asChild>
                <button type="button" className={dockItemClass}>
                  <span className="text-xs text-muted-foreground">{t('compactControls.brand')}</span>
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Palette className="size-4" />
                    <span>{t('brandBasics')}</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-[min(30rem,calc(100vw-1.5rem))] rounded-[1.4rem] border-border/60 bg-background/90 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold">{t('brandBasics')}</p>
                  <p className="text-xs text-muted-foreground">{t('brandBasicsHint')}</p>
                </div>
                <div className="max-h-[min(58dvh,32rem)] overflow-y-auto pr-1">{brandContent}</div>
              </PopoverContent>
            </Popover>

            <Popover
              open={activePanel === 'advanced'}
              onOpenChange={(open) => setActivePanel(open ? 'advanced' : null)}
            >
              <PopoverTrigger asChild>
                <button type="button" className={dockItemClass}>
                  <span className="text-xs text-muted-foreground">{t('compactControls.advanced')}</span>
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <SlidersHorizontal className="size-4" />
                    <span>{t('advanced')}</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                sideOffset={12}
                className="w-[min(34rem,calc(100vw-1.5rem))] rounded-[1.4rem] border-border/60 bg-background/90 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold">{t('advanced')}</p>
                  <p className="text-xs text-muted-foreground">{t('advancedHint')}</p>
                </div>
                <div className="max-h-[min(58dvh,32rem)] overflow-y-auto pr-1">{advancedContent}</div>
              </PopoverContent>
            </Popover>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-1 flex items-center gap-2">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-[1rem] border-border/55 bg-background/24 gap-1.5 backdrop-blur-sm"
            onClick={() => resetToPreset(config.basePreset)}
          >
            <RotateCcw className="size-3.5" />
            <span>{t('reset')}</span>
          </Button>
          <Button className="h-11 flex-1 rounded-[1rem] gap-1.5 shadow-sm" onClick={onSave}>
            <Save className="size-3.5" />
            <span>{t('editor.saveTheme')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
