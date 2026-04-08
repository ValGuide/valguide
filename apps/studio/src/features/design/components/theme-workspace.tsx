import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { cn } from '@valguide/ui/lib/utils'
import { useEffect, useMemo } from 'react'
import { ensureThemeFontsLoaded } from '../font-loader'
import type { UseThemeCustomizerReturn } from '../use-theme-customizer'
import { PlayerPreview } from './player-preview'
import { ThemeEditorPanel } from './theme-editor-panel'
import { ThemeMobileDock } from './theme-mobile-dock'

export interface ThemeWorkspaceProps {
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
  compactFooter?: React.ReactNode
  className?: string
}

export function ThemeWorkspace({
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
  compactFooter,
  className,
}: ThemeWorkspaceProps) {
  const cssVariables = customizer.getCSSVariables()
  const previewStyle = useMemo(() => cssVariables as React.CSSProperties, [cssVariables])

  useEffect(() => {
    void ensureThemeFontsLoaded(customizer.config.fonts)
  }, [customizer.config.fonts])

  const previewPanel = ({
    containerClassName,
    previewClassName,
    previewInnerClassName,
    playerClassName,
    previewFooterClassName,
    playerVariant,
  }: {
    containerClassName?: string
    previewClassName?: string
    previewInnerClassName?: string
    playerClassName?: string
    previewFooterClassName?: string
    playerVariant?: 'default' | 'storyboard'
  }) => (
    <div className={cn('flex flex-col gap-4', containerClassName)}>
      <div
        className={cn(
          'flex min-h-0 flex-col rounded-xl border bg-muted/30 px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)]',
          previewClassName,
        )}
      >
        <div className={cn('flex min-h-full items-start justify-center', previewInnerClassName)}>
          <PlayerPreview
            style={previewStyle}
            variant={playerVariant}
            className={cn('w-full shadow-xl', playerClassName)}
          />
        </div>
        <div aria-hidden="true" className={previewFooterClassName} />
      </div>
    </div>
  )

  return (
    <div className={cn('flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6', className)}>
      <div className="relative flex min-h-0 flex-col gap-4 overflow-y-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:hidden">
        {previewPanel({
          containerClassName: 'min-h-0 flex-1',
          previewClassName: 'flex-1 min-h-[clamp(18rem,48dvh,32rem)] md:min-h-[clamp(24rem,58dvh,40rem)]',
          playerClassName: 'max-w-[clamp(16rem,78vw,30rem)]',
          previewFooterClassName: 'h-[clamp(11rem,28vw,14rem)] md:h-[clamp(12rem,24vw,15rem)]',
        })}
        <ThemeMobileDock
          customizer={customizer}
          themes={themes}
          defaultThemeId={defaultThemeId}
          canManageDefaultTheme={canManageDefaultTheme}
          isLoading={isLoading}
          onSelectTheme={onSelectTheme}
          onStartFromPreset={onStartFromPreset}
          onDeleteTheme={onDeleteTheme}
          onSetDefaultTheme={onSetDefaultTheme}
          onClearDefaultTheme={onClearDefaultTheme}
          onSave={onSave}
          showDeleteThemes={showDeleteThemes}
        />
        {compactFooter ? <div>{compactFooter}</div> : null}
      </div>

      <div className="hidden min-h-0 w-full min-w-0 flex-1 overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,24rem)] lg:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,27rem)] xl:gap-8">
        {previewPanel({
          containerClassName:
            'min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          previewClassName: 'h-full overflow-hidden px-0 py-0',
          previewInnerClassName:
            'min-h-0 flex-1 justify-center overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          playerClassName: 'mx-auto min-w-fit max-w-none shadow-none',
          previewFooterClassName: 'hidden',
          playerVariant: 'storyboard',
        })}
        <ThemeEditorPanel
          customizer={customizer}
          themes={themes}
          defaultThemeId={defaultThemeId}
          canManageDefaultTheme={canManageDefaultTheme}
          isLoading={isLoading}
          onSelectTheme={onSelectTheme}
          onStartFromPreset={onStartFromPreset}
          onDeleteTheme={onDeleteTheme}
          onSetDefaultTheme={onSetDefaultTheme}
          onClearDefaultTheme={onClearDefaultTheme}
          onSave={onSave}
          showDeleteThemes={showDeleteThemes}
          layout="split"
          className="min-h-0 h-full min-w-0"
        />
      </div>
    </div>
  )
}
