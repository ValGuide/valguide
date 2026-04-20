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
  onOpenAiAssistant?: () => void
  onDiscardAiDraft?: () => void
  aiDraftSummary?: string | null
  aiDraftMoodKeywords?: string[]
  aiDraftSourceHighlights?: string[]
  showDeleteThemes?: boolean
  compactFooter?: React.ReactNode
  mobileIntro?: React.ReactNode
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
  onOpenAiAssistant,
  onDiscardAiDraft,
  aiDraftSummary,
  aiDraftMoodKeywords,
  aiDraftSourceHighlights,
  showDeleteThemes = true,
  compactFooter,
  mobileIntro,
  className,
}: ThemeWorkspaceProps) {
  const cssVariables = customizer.getCSSVariables()
  const previewStyle = useMemo(() => cssVariables as React.CSSProperties, [cssVariables])

  useEffect(() => {
    void ensureThemeFontsLoaded(customizer.config.fonts)
  }, [customizer.config.fonts])

  return (
    <div className={cn('flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6', className)}>
      <div className="relative flex min-h-0 flex-col gap-4 overflow-y-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:hidden">
        {mobileIntro ? <div className="sm:hidden">{mobileIntro}</div> : null}
        <div className="flex flex-col">
          <div className="rounded-xl border bg-muted/30 px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)]">
            <div className="flex w-full justify-center">
              <PlayerPreview
                style={previewStyle}
                className="mx-auto w-full max-w-[clamp(16rem,78vw,30rem)] shadow-xl"
              />
            </div>
          </div>
          <div aria-hidden="true" className="h-[clamp(13rem,34vw,16rem)] md:h-[clamp(14rem,28vw,17rem)]" />
        </div>
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
          onOpenAiAssistant={onOpenAiAssistant}
          showDeleteThemes={showDeleteThemes}
        />
        {compactFooter ? <div>{compactFooter}</div> : null}
      </div>

      <div className="hidden min-h-0 w-full min-w-0 flex-1 overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,24rem)] lg:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,27rem)] xl:gap-8">
        <div className="flex h-full min-h-0 flex-col overflow-hidden pr-2">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-muted/30">
            <div className="min-h-0 flex-1 overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-h-full min-w-full w-fit justify-center">
                <PlayerPreview style={previewStyle} variant="storyboard" className="min-w-fit max-w-none shadow-none" />
              </div>
            </div>
          </div>
        </div>
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
          onOpenAiAssistant={onOpenAiAssistant}
          onDiscardAiDraft={onDiscardAiDraft}
          aiDraftSummary={aiDraftSummary}
          aiDraftMoodKeywords={aiDraftMoodKeywords}
          aiDraftSourceHighlights={aiDraftSourceHighlights}
          showDeleteThemes={showDeleteThemes}
          layout="split"
          className="min-h-0 h-full min-w-0"
        />
      </div>
    </div>
  )
}
