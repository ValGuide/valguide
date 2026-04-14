import { getThemeUsageDetailsFn } from '@valguide/core/features/themes/get-theme-usage.fn'
import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { cn } from '@valguide/ui/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useOrgThemesSuspense } from '../hooks/use-org-themes'
import { getThemeSaveErrorMessage } from '../theme-save-errors'
import type { EditorThemeConfig } from '../types'
import { useThemeCustomizer } from '../use-theme-customizer'
import { DeleteThemeDialog } from './delete-theme-dialog'
import { SaveThemeDialog } from './save-theme-dialog'
import { ThemeAiAssistantDialog, type ThemeAiAssistantResult } from './theme-ai-assistant-dialog'
import { ThemeWorkspace } from './theme-workspace'

export interface ThemeCustomizerContainerProps {
  className?: string
  mobileIntro?: React.ReactNode
  openAiAssistantSignal?: boolean
  onAiAssistantSignalHandled?: () => void
}

interface AiDraftState {
  sourceUrl?: string
  notes?: string
  sourceImageCount: number
  summary: string | null
  moodKeywords: string[]
  sourceHighlights: string[]
}

function cloneThemeConfig(config: EditorThemeConfig): EditorThemeConfig {
  return {
    ...config,
    colors: { ...config.colors },
    fonts: {
      ...config.fonts,
      primary: { ...config.fonts.primary },
    },
  }
}

export function ThemeCustomizerContainer({
  className,
  mobileIntro,
  openAiAssistantSignal = false,
  onAiAssistantSignalHandled,
}: ThemeCustomizerContainerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const {
    themes,
    defaultThemeId,
    currentUserRole,
    isLoading,
    createTheme,
    updateTheme,
    deleteTheme,
    setDefaultTheme,
    clearDefaultTheme,
  } = useOrgThemesSuspense()
  const defaultTheme = defaultThemeId ? (themes.find((theme) => theme.id === defaultThemeId) ?? null) : null
  const customizer = useThemeCustomizer(defaultTheme ?? 'light')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiDraft, setAiDraft] = useState<AiDraftState | null>(null)
  const [aiBaselineConfig, setAiBaselineConfig] = useState<EditorThemeConfig | null>(null)
  const hasExplicitSelectionRef = useRef(false)

  useEffect(() => {
    if (hasExplicitSelectionRef.current || customizer.config.id || customizer.config.isDirty || !defaultThemeId) {
      return
    }

    const defaultTheme = themes.find((theme) => theme.id === defaultThemeId)
    if (defaultTheme) {
      customizer.loadTheme(defaultTheme)
    }
  }, [customizer, defaultThemeId, themes])

  useEffect(() => {
    if (openAiAssistantSignal) {
      setAiAssistantOpen(true)
    }
  }, [openAiAssistantSignal])

  const clearAiDraftState = useCallback(() => {
    setAiBaselineConfig(null)
    setAiDraft(null)
  }, [])

  const handleSelectTheme = useCallback(
    (theme: Theme) => {
      hasExplicitSelectionRef.current = true
      clearAiDraftState()
      customizer.loadTheme(theme)
    },
    [clearAiDraftState, customizer],
  )

  const handleStartFromPreset = useCallback(
    (preset: ThemePreset) => {
      hasExplicitSelectionRef.current = true
      clearAiDraftState()
      customizer.startNewTheme(preset, { isDirty: true })
    },
    [clearAiDraftState, customizer],
  )

  const handleOpenDeleteDialog = useCallback((theme: Theme) => {
    setThemeToDelete(theme)
    setDeleteDialogOpen(true)
  }, [])

  const handleSetDefaultTheme = useCallback(
    async (theme: Theme) => {
      try {
        await setDefaultTheme(theme.id)
        toast.success(t('toast.defaultSet', { name: theme.name }))
      } catch (error) {
        const message = error instanceof Error ? error.message : t('toast.defaultError')
        toast.error(message)
        throw error
      }
    },
    [setDefaultTheme, t],
  )

  const handleClearDefaultTheme = useCallback(async () => {
    try {
      await clearDefaultTheme()
      toast.success(t('toast.defaultCleared'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.defaultError')
      toast.error(message)
      throw error
    }
  }, [clearDefaultTheme, t])

  const handleSave = useCallback(
    async (name: string, saveAsNew: boolean) => {
      setIsSaving(true)
      setSaveError(null)

      try {
        const duplicateTheme = themes.find((theme) => {
          if (theme.name !== name) {
            return false
          }

          if (!saveAsNew && theme.id === customizer.config.id) {
            return false
          }

          return true
        })

        if (duplicateTheme) {
          setSaveError(t('saveDialog.nameExists'))
          return
        }

        const themeData = customizer.getThemeData()

        if (saveAsNew || !customizer.config.id) {
          const created = await createTheme({
            name,
            ...themeData,
          })
          customizer.setThemeMetadata(created.id, created.name)
          customizer.markClean()
          toast.success(t('toast.created'))
        } else {
          const updated = await updateTheme(customizer.config.id, {
            name,
            ...themeData,
          })
          customizer.setThemeMetadata(updated.id, updated.name)
          customizer.markClean()
          toast.success(t('toast.updated'))
        }

        setAiBaselineConfig(null)
        setSaveDialogOpen(false)
      } catch (error) {
        const message = getThemeSaveErrorMessage(error, t)
        setSaveError(message)
      } finally {
        setIsSaving(false)
      }
    },
    [customizer, createTheme, themes, updateTheme, t],
  )

  const handleDelete = useCallback(async () => {
    if (!themeToDelete) return

    setIsDeleting(true)

    try {
      await deleteTheme(themeToDelete.id)

      if (customizer.config.id === themeToDelete.id) {
        clearAiDraftState()
        customizer.startNewTheme('light', { isDirty: false })
      }

      toast.success(t('toast.deleted'))
      setDeleteDialogOpen(false)
      setThemeToDelete(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete theme'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }, [themeToDelete, deleteTheme, customizer, clearAiDraftState, t])

  const handleAiAssistantOpenChange = useCallback(
    (open: boolean) => {
      setAiAssistantOpen(open)

      if (!open && openAiAssistantSignal) {
        onAiAssistantSignalHandled?.()
      }
    },
    [onAiAssistantSignalHandled, openAiAssistantSignal],
  )

  const handleAiGenerated = useCallback(
    (result: ThemeAiAssistantResult) => {
      if (!aiDraft) {
        setAiBaselineConfig(cloneThemeConfig(customizer.config))
      }

      customizer.loadDraftThemeConfig({
        name: result.suggestion.name,
        basePreset: result.suggestion.basePreset,
        colors: result.suggestion.colors,
        radius: result.suggestion.radius,
        fonts: result.suggestion.fonts,
      })

      setAiDraft({
        sourceUrl: result.sourceUrl,
        notes: result.notes,
        sourceImageCount: result.sourceImageCount,
        summary: result.suggestion.summary,
        moodKeywords: result.suggestion.moodKeywords,
        sourceHighlights: result.suggestion.sourceHighlights,
      })
    },
    [aiDraft, customizer],
  )

  const handleDiscardAiDraft = useCallback(() => {
    if (!aiBaselineConfig) {
      setAiDraft(null)
      return
    }

    customizer.loadThemeConfig(aiBaselineConfig)
    setAiBaselineConfig(null)
    setAiDraft(null)
    toast.success(t('aiAssistant.discardedToast'))
  }, [aiBaselineConfig, customizer, t])

  return (
    <div className={cn('flex min-h-0 w-full flex-1 flex-col gap-6', className)}>
      <ThemeWorkspace
        customizer={customizer}
        themes={themes}
        defaultThemeId={defaultThemeId}
        canManageDefaultTheme={currentUserRole === 'owner' || currentUserRole === 'admin'}
        isLoading={isLoading}
        onSelectTheme={handleSelectTheme}
        onStartFromPreset={handleStartFromPreset}
        onDeleteTheme={handleOpenDeleteDialog}
        onSetDefaultTheme={handleSetDefaultTheme}
        onClearDefaultTheme={handleClearDefaultTheme}
        onSave={() => setSaveDialogOpen(true)}
        onOpenAiAssistant={() => handleAiAssistantOpenChange(true)}
        onDiscardAiDraft={aiBaselineConfig ? handleDiscardAiDraft : undefined}
        aiDraftSummary={aiDraft?.summary}
        aiDraftMoodKeywords={aiDraft?.moodKeywords}
        aiDraftSourceHighlights={aiDraft?.sourceHighlights}
        mobileIntro={mobileIntro}
      />

      <SaveThemeDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        existingThemeId={customizer.config.id}
        existingThemeName={customizer.config.name}
        onSave={handleSave}
        isLoading={isSaving}
        error={saveError}
      />

      <DeleteThemeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        themeId={themeToDelete?.id ?? ''}
        themeName={themeToDelete?.name ?? ''}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        onGetUsage={async (themeId) => getThemeUsageDetailsFn({ data: { themeId } })}
      />

      <ThemeAiAssistantDialog
        open={aiAssistantOpen}
        onOpenChange={handleAiAssistantOpenChange}
        initialSourceUrl={aiDraft?.sourceUrl}
        initialNotes={aiDraft?.notes}
        onGenerated={handleAiGenerated}
      />
    </div>
  )
}
