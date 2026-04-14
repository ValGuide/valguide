import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@valguide/ui/components/collapsible'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronDown, RotateCcw, Save } from 'lucide-react'
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

export interface ThemeEditorPanelProps {
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
  layout?: 'workspace' | 'split' | 'mobile'
  className?: string
}

export function ThemeEditorPanel({
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
  layout = 'split',
  className,
}: ThemeEditorPanelProps) {
  const t = useTranslations('studio.themeCustomizer')
  const { config, setColor, setRadius, setFonts, reset } = customizer
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColor(key, value)
  }

  const handleReset = () => {
    reset()
  }

  const isWorkspaceLayout = layout === 'workspace'
  const isMobileLayout = layout === 'mobile'
  const isSplitLayout = layout === 'split'
  const currentThemeLabel = config.name ?? formatThemePresetLabel(config.basePreset)
  const isDefaultTheme = config.id != null && config.id === defaultThemeId
  const currentThemeSwatches = [
    { key: 'background', color: config.colors.background },
    { key: 'primary', color: config.colors.primary },
    { key: 'accent', color: config.colors.accent },
    { key: 'foreground', color: config.colors.foreground },
  ]

  const pickerContent = (
    <>
      <SavedThemesList
        themes={themes}
        isLoading={isLoading}
        selectedThemeId={config.id}
        defaultThemeId={defaultThemeId}
        canManageDefaultTheme={canManageDefaultTheme}
        onSelectTheme={(theme) => {
          onSelectTheme(theme)
          setIsThemePickerOpen(false)
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

      <div className={cn(themes.length > 0 && 'mt-4 border-t pt-4')}>
        <ThemePresetChips
          value={config.basePreset}
          onSelect={(preset) => {
            onStartFromPreset(preset)
            setIsThemePickerOpen(false)
          }}
        />
      </div>
    </>
  )

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
          'space-y-4 border-b !pb-3',
          isMobileLayout ? 'px-4 py-4' : isWorkspaceLayout ? 'px-6 py-5 sm:px-8' : 'px-6 pt-4 pb-0',
        )}
      >
        <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
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
      </CardHeader>

      <CardContent className={cn('min-h-0 flex-1 p-0', (isMobileLayout || isSplitLayout) && 'overflow-hidden')}>
        <div
          className={cn(
            'space-y-4 pb-6',
            isMobileLayout
              ? 'h-full overflow-y-auto px-4 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
              : isWorkspaceLayout
                ? 'px-6 pt-4 sm:px-8'
                : isSplitLayout
                  ? 'h-full overflow-y-auto px-6 pt-4'
                  : 'px-6 pt-4',
          )}
        >
          <section className="rounded-2xl border bg-muted/15 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{t('currentThemeTitle')}</p>
                  {isDefaultTheme ? <Badge variant="outline">{t('themeLibrary.defaultBadge')}</Badge> : null}
                  {config.isDirty ? <Badge variant="outline">{t('editor.unsavedChanges')}</Badge> : null}
                </div>
                <div>
                  <p className="truncate text-lg font-semibold">{currentThemeLabel}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {currentThemeSwatches.map((swatch) => (
                  <div
                    key={swatch.key}
                    className="size-10 rounded-lg border border-border/70 shadow-xs"
                    style={{ backgroundColor: swatch.color }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border p-4">
            <div className="mb-4 space-y-1">
              <p className="text-sm font-medium">{t('chooseThemeTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('chooseThemeDescription')}</p>
            </div>

            {isMobileLayout ? (
              <>
                <div className="rounded-xl border bg-muted/15 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{currentThemeLabel}</p>
                      <p className="text-xs text-muted-foreground">{t('themeLibrary.selectHint')}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsThemePickerOpen(true)}>
                      {t('themeLibrary.openPicker')}
                    </Button>
                  </div>
                </div>

                <Drawer open={isThemePickerOpen} onOpenChange={setIsThemePickerOpen}>
                  <DrawerContent className="max-h-[78dvh] rounded-t-[1.25rem]">
                    <DrawerHeader className="text-left">
                      <DrawerTitle>{t('chooseThemeTitle')}</DrawerTitle>
                      <DrawerDescription>{t('chooseThemeDescription')}</DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                      {pickerContent}
                    </div>
                  </DrawerContent>
                </Drawer>
              </>
            ) : (
              pickerContent
            )}
          </section>

          <section className="rounded-2xl border p-4">
            <div className="mb-4 space-y-1">
              <p className="text-sm font-medium">{t('brandBasics')}</p>
              <p className="text-sm text-muted-foreground">{t('brandBasicsHint')}</p>
            </div>

            <ColorGroup
              title={t('brandBasics')}
              colorKeys={brandBasicsColorKeys}
              colors={config.colors}
              onColorChange={handleColorChange}
              defaultOpen
              showTitle={false}
            />
          </section>

          <section className="rounded-2xl border p-4">
            <FontControls fonts={config.fonts} onChange={setFonts} />
          </section>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <section className="rounded-2xl border">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/25">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('advanced')}</p>
                  <p className="text-sm text-muted-foreground">{t('advancedHint')}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
                  <span>{isAdvancedOpen ? t('collapseAdvanced') : t('expandAdvanced')}</span>
                  <ChevronDown
                    className={cn('size-4 transition-transform', isAdvancedOpen && 'rotate-180', 'text-foreground')}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 border-t px-4 pb-4 pt-4">
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
              </CollapsibleContent>
            </section>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
