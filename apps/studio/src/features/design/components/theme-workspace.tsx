import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { useEffect, useMemo } from 'react'
import { ensureThemeFontsLoaded } from '../font-loader'
import { formatThemePresetLabel } from '../theme-display'
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
  previewDescription?: React.ReactNode
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
  previewDescription,
  compactFooter,
  className,
}: ThemeWorkspaceProps) {
  const t = useTranslations('studio.themeCustomizer')

  const cssVariables = customizer.getCSSVariables()
  const previewStyle = useMemo(() => cssVariables as React.CSSProperties, [cssVariables])

  useEffect(() => {
    void ensureThemeFontsLoaded(customizer.config.fonts)
  }, [customizer.config.fonts])

  const currentThemeLabel = customizer.config.name ?? formatThemePresetLabel(customizer.config.basePreset)

  const previewPanel = ({
    containerClassName,
    previewClassName,
    playerClassName,
  }: {
    containerClassName?: string
    previewClassName?: string
    playerClassName?: string
  }) => (
    <div className={cn('flex flex-col gap-4', containerClassName)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('visitorPreview')}</h2>
        <span className="truncate text-sm text-muted-foreground">{currentThemeLabel}</span>
      </div>
      <div className={cn('rounded-xl border bg-muted/30 p-6 sm:p-8', previewClassName)}>
        <div className="mb-4 text-sm text-muted-foreground">{previewDescription ?? t('previewNote')}</div>
        <div className="flex min-h-full items-start justify-center overflow-hidden">
          <PlayerPreview style={previewStyle} className={cn('w-full shadow-xl', playerClassName)} />
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6', className)}>
      <div className="relative flex min-h-0 flex-col gap-4 overflow-y-auto pb-4 min-[1180px]:hidden">
        {previewPanel({
          containerClassName: 'min-h-0 flex-1',
          previewClassName:
            'flex-1 min-h-[clamp(18rem,48dvh,32rem)] px-4 py-4 pb-40 md:min-h-[clamp(24rem,58dvh,40rem)] md:px-6 md:py-6 md:pb-44',
          playerClassName: 'max-w-[20rem] sm:max-w-[24rem] md:max-w-[28rem]',
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

      <div className="hidden min-h-0 w-full min-w-0 flex-1 overflow-hidden min-[1180px]:grid min-[1180px]:grid-cols-[minmax(0,1.45fr)_minmax(0,24rem)] min-[1180px]:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,27rem)] xl:gap-8">
        {previewPanel({
          containerClassName: 'min-h-0 overflow-y-auto pr-2',
          playerClassName: 'max-w-md',
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
