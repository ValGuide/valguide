import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { cn } from '@valguide/ui/lib/utils'
import { useCallback, useMemo, useState } from 'react'
import { useOrgThemes } from '../hooks/use-org-themes'
import { useThemeCustomizer } from '../use-theme-customizer'
import { DeleteThemeDialog } from './delete-theme-dialog'
import { PlayerPreview } from './player-preview'
import { SaveThemeDialog } from './save-theme-dialog'
import { ThemeCompactControls } from './theme-compact-controls'
import { ThemeEditorPanel } from './theme-editor-panel'

export interface ThemeCustomizerContainerProps {
  className?: string
}

export function ThemeCustomizerContainer({ className }: ThemeCustomizerContainerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const customizer = useThemeCustomizer('light')
  const { themes, isLoading, createTheme, updateTheme, deleteTheme } = useOrgThemes()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const cssVariables = customizer.getCSSVariables()
  const previewStyle = useMemo(() => cssVariables as React.CSSProperties, [cssVariables])

  const handleSelectTheme = useCallback(
    (theme: Theme) => {
      customizer.loadTheme(theme)
    },
    [customizer],
  )

  const handleStartFromPreset = useCallback(
    (preset: ThemePreset) => {
      customizer.startNewTheme(preset)
    },
    [customizer],
  )

  const handleOpenDeleteDialog = useCallback((theme: Theme) => {
    setThemeToDelete(theme)
    setDeleteDialogOpen(true)
  }, [])

  const handleSave = useCallback(
    async (name: string, saveAsNew: boolean) => {
      setIsSaving(true)
      setSaveError(null)

      try {
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

        setSaveDialogOpen(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save theme'
        setSaveError(message)
      } finally {
        setIsSaving(false)
      }
    },
    [customizer, createTheme, updateTheme, t],
  )

  const handleDelete = useCallback(async () => {
    if (!themeToDelete) return

    setIsDeleting(true)

    try {
      await deleteTheme(themeToDelete.id)

      if (customizer.config.id === themeToDelete.id) {
        customizer.startNewTheme('light')
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
  }, [themeToDelete, deleteTheme, customizer, t])

  const currentThemeLabel =
    customizer.config.name ??
    customizer.config.basePreset
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

  const editorPanel = (layout: 'workspace' | 'split' | 'mobile') => (
    <ThemeEditorPanel
      customizer={customizer}
      themes={themes}
      isLoading={isLoading}
      onSelectTheme={handleSelectTheme}
      onStartFromPreset={handleStartFromPreset}
      onDeleteTheme={handleOpenDeleteDialog}
      onSave={() => setSaveDialogOpen(true)}
      layout={layout}
    />
  )

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
        <h2 className="text-lg font-semibold">{t('livePreview')}</h2>
        <span className="text-sm text-muted-foreground truncate">{currentThemeLabel}</span>
      </div>
      <div className={cn('rounded-xl border bg-muted/30 p-6 sm:p-8', previewClassName)}>
        <div className="flex min-h-full items-start justify-center overflow-hidden">
          <PlayerPreview style={previewStyle} className={cn('w-full shadow-xl', playerClassName)} />
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      <div className="flex min-h-[calc(100dvh-12rem)] flex-col gap-4 min-[1180px]:hidden">
        {previewPanel({
          containerClassName: 'min-h-0 flex-1',
          previewClassName:
            'flex-1 min-h-[clamp(16rem,42dvh,22rem)] px-4 py-4 md:min-h-[clamp(20rem,48dvh,30rem)] md:px-6 md:py-6',
          playerClassName: 'max-w-[19rem] md:max-w-[24rem]',
        })}
        <ThemeCompactControls
          customizer={customizer}
          themes={themes}
          isLoading={isLoading}
          onSelectTheme={handleSelectTheme}
          onStartFromPreset={handleStartFromPreset}
          onDeleteTheme={handleOpenDeleteDialog}
          onSave={() => setSaveDialogOpen(true)}
        />
      </div>

      <div className="hidden w-full gap-6 min-[1180px]:grid min-[1180px]:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)] min-[1180px]:items-start xl:gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(400px,0.92fr)]">
        {previewPanel({ playerClassName: 'max-w-md' })}
        {editorPanel('split')}
      </div>

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
        themeName={themeToDelete?.name ?? ''}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
