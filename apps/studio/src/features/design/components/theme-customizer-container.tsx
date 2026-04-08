import { getThemeUsageDetailsFn } from '@valguide/core/features/themes/get-theme-usage.fn'
import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { cn } from '@valguide/ui/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { useOrgThemes } from '../hooks/use-org-themes'
import { getThemeSaveErrorMessage } from '../theme-save-errors'
import { useThemeCustomizer } from '../use-theme-customizer'
import { DeleteThemeDialog } from './delete-theme-dialog'
import { SaveThemeDialog } from './save-theme-dialog'
import { ThemeWorkspace } from './theme-workspace'

export interface ThemeCustomizerContainerProps {
  className?: string
}

export function ThemeCustomizerContainer({ className }: ThemeCustomizerContainerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const customizer = useThemeCustomizer('light')
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
  } = useOrgThemes()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (customizer.config.id || customizer.config.isDirty || !defaultThemeId) {
      return
    }

    const defaultTheme = themes.find((theme) => theme.id === defaultThemeId)
    if (defaultTheme) {
      customizer.loadTheme(defaultTheme)
    }
  }, [customizer, defaultThemeId, themes])

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
    </div>
  )
}
