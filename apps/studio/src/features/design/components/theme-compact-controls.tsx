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
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Separator } from '@valguide/ui/components/separator'
import { cn } from '@valguide/ui/lib/utils'
import { Layers2, Palette, RotateCcw, Save, SlidersHorizontal, SwatchBook } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
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

type CompactPanel = 'styles' | 'brand' | 'advanced' | null

export interface ThemeCompactControlsProps {
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
  footer?: React.ReactNode
  className?: string
}

export function ThemeCompactControls({
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
  footer,
  className,
}: ThemeCompactControlsProps) {
  const t = useTranslations('studio.themeCustomizer')
  const isMobile = useIsMobile()
  const [activePanel, setActivePanel] = useState<CompactPanel>(null)
  const { config, setColor, setRadius, resetToPreset } = customizer

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1180px)')
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setActivePanel(null)
      }
    }

    handleChange(mediaQuery)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

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
    activePanel === 'styles'
      ? t('compactControls.styles')
      : activePanel === 'brand'
        ? t('compactControls.brand')
        : activePanel === 'advanced'
          ? t('compactControls.advanced')
          : ''

  const closePanel = () => setActivePanel(null)

  const themesPanelContent = (
    <div className="space-y-5">
      <ThemePresetChips value={config.basePreset} onSelect={onStartFromPreset} />
      {themes.length > 0 ? (
        <>
          <Separator />
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
        </>
      ) : null}
    </div>
  )

  const brandPanelContent = (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SwatchBook className="size-4" />
          <span>{t('compactControls.brandSummary')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            config.colors.primary,
            config.colors.primaryForeground,
            config.colors.background,
            config.colors.foreground,
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
        title={t('brandBasics')}
        colorKeys={brandBasicsColorKeys}
        colors={config.colors}
        onColorChange={handleColorChange}
        defaultOpen
      />
      <p className="text-xs text-muted-foreground">{t('brandBasicsHint')}</p>
    </div>
  )

  const advancedPanelContent = (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{t('advancedHint')}</p>
      <RadiusSelector
        value={config.radius}
        onValueChange={(value) => {
          setRadius(value)
          if (!isMobile) {
            closePanel()
          }
        }}
      />
      <ColorGroup
        title={t('supportingColors')}
        colorKeys={supportingColorKeys}
        colors={config.colors}
        onColorChange={handleColorChange}
        defaultOpen
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

  const drawerHeightClass = isMobile
    ? activePanel === 'advanced'
      ? '!h-[min(76dvh,44rem)] !max-h-[76dvh]'
      : '!h-[min(42dvh,24rem)] !max-h-[42dvh]'
    : '!h-[min(60dvh,38rem)] !max-h-[60dvh]'

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
          {isMobile ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePanel('styles')}>
              <Layers2 className="size-4" />
              <span>{t('compactControls.styles')}</span>
            </Button>
          ) : (
            <Popover open={activePanel === 'styles'} onOpenChange={(open) => setActivePanel(open ? 'styles' : null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Layers2 className="size-4" />
                  <span>{t('compactControls.styles')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" sideOffset={12} className="w-[min(30rem,calc(100vw-2rem))] p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold">{t('compactControls.styles')}</p>
                    <p className="text-xs text-muted-foreground">{currentThemeLabel}</p>
                  </div>
                  <div className="max-h-[min(52dvh,30rem)] overflow-y-auto pr-1">{themesPanelContent}</div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isMobile ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePanel('brand')}>
              <Palette className="size-4" />
              <span>{t('compactControls.brand')}</span>
            </Button>
          ) : (
            <Popover open={activePanel === 'brand'} onOpenChange={(open) => setActivePanel(open ? 'brand' : null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Palette className="size-4" />
                  <span>{t('compactControls.brand')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="center" side="top" sideOffset={12} className="w-[min(28rem,calc(100vw-2rem))] p-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold">{t('compactControls.brand')}</p>
                  {brandPanelContent}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isMobile ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePanel('advanced')}>
              <SlidersHorizontal className="size-4" />
              <span>{t('compactControls.advanced')}</span>
            </Button>
          ) : (
            <Popover
              open={activePanel === 'advanced'}
              onOpenChange={(open) => setActivePanel(open ? 'advanced' : null)}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <SlidersHorizontal className="size-4" />
                  <span>{t('compactControls.advanced')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="top" sideOffset={12} className="w-[min(38rem,calc(100vw-2rem))] p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold">{t('compactControls.advanced')}</p>
                    <p className="text-xs text-muted-foreground">{currentThemeLabel}</p>
                  </div>
                  <ScrollArea className="h-[min(60dvh,36rem)]">
                    <div className="pr-4">{advancedPanelContent}</div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {footer ? <div className="mt-3 border-t pt-3">{footer}</div> : null}
      </div>

      <Drawer open={isMobile && activePanel !== null} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DrawerContent className={cn(drawerHeightClass, 'rounded-t-[1.25rem]')}>
          <DrawerHeader className="text-left">
            <DrawerTitle>{panelTitle}</DrawerTitle>
            <DrawerDescription className="sr-only">{panelTitle}</DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {activePanel === 'styles' ? themesPanelContent : null}
            {activePanel === 'brand' ? brandPanelContent : null}
            {activePanel === 'advanced' ? advancedPanelContent : null}
          </div>

          <DrawerFooter className="border-t bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button variant="outline" onClick={closePanel}>
              {t('saveDialog.cancel')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
