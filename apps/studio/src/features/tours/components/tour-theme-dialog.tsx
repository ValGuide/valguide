import { useQueryClient } from '@tanstack/react-query'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { updateTourSettingsDraftFn } from '@valguide/core/features/tours/tour/settings/update-tour-settings-draft.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Loader2, Palette } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ThemeWorkspace } from '@/features/design/components/theme-workspace'
import { useOrgThemes } from '@/features/design/hooks/use-org-themes'
import { getThemeSaveErrorMessage } from '@/features/design/theme-save-errors'
import { useThemeCustomizer } from '@/features/design/use-theme-customizer'
import { SaveThemeDialog } from '../../design/components/save-theme-dialog'

type TourThemeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourNanoId: string
  theme: TourDetail['theme']
}

export function TourThemeDialog({ open, onOpenChange, tourNanoId, theme }: TourThemeDialogProps) {
  const t = useTranslations('tours.theme')
  const tThemeCustomizer = useTranslations('studio.themeCustomizer')
  const queryClient = useQueryClient()
  const customizer = useThemeCustomizer(theme.effectiveTheme?.config.basePreset ?? 'light')
  const { themes, isLoading, createTheme } = useOrgThemes({ enabled: open })
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    if (theme.effectiveTheme) {
      customizer.loadThemeConfig({
        id: theme.effectiveTheme.id,
        name: theme.effectiveTheme.name,
        ...theme.effectiveTheme.config,
      })
      return
    }

    customizer.startNewTheme('light')
  }, [customizer.loadThemeConfig, customizer.startNewTheme, open, theme.effectiveTheme])

  const currentSelectionMatchesLiveTheme =
    !customizer.config.isDirty &&
    customizer.config.id !== undefined &&
    customizer.config.id === theme.effectiveTheme?.id

  const invalidateThemeQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['tour', tourNanoId] })
    await queryClient.invalidateQueries({ queryKey: ['tours'] })
  }, [queryClient, tourNanoId])

  const applyTheme = useCallback(
    async (themeId: string | null) => {
      setIsApplying(true)

      try {
        await updateTourSettingsDraftFn({
          data: {
            nanoId: tourNanoId,
            themeId,
          },
        })
        await invalidateThemeQueries()
        toast.success(themeId ? t('toast.updated') : t('toast.reset'))
        onOpenChange(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : t('toast.error')
        toast.error(message)
      } finally {
        setIsApplying(false)
      }
    },
    [invalidateThemeQueries, onOpenChange, t, tourNanoId],
  )

  const handleSave = useCallback(
    async (name: string) => {
      setIsSaving(true)
      setSaveError(null)

      try {
        const created = await createTheme({
          name,
          ...customizer.getThemeData(),
        })

        customizer.setThemeMetadata(created.id, created.name)
        customizer.markClean()

        await updateTourSettingsDraftFn({
          data: {
            nanoId: tourNanoId,
            themeId: created.id,
          },
        })

        await invalidateThemeQueries()
        toast.success(t('toast.createdAndApplied'))
        setSaveDialogOpen(false)
        onOpenChange(false)
      } catch (error) {
        setSaveError(getThemeSaveErrorMessage(error, tThemeCustomizer))
      } finally {
        setIsSaving(false)
      }
    },
    [createTheme, customizer, invalidateThemeQueries, onOpenChange, t, tThemeCustomizer, tourNanoId],
  )

  const primaryAction =
    customizer.config.id && !customizer.config.isDirty ? (
      <Button
        onClick={() => void applyTheme(customizer.config.id ?? null)}
        disabled={isApplying || currentSelectionMatchesLiveTheme}
      >
        {isApplying ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {t('apply')}
      </Button>
    ) : (
      <Button onClick={() => setSaveDialogOpen(true)} disabled={isApplying}>
        {t('saveAsNewAndApply')}
      </Button>
    )

  const compactFooter = (
    <div className="grid gap-2 sm:grid-cols-2">
      {theme.assignedThemeId ? (
        <Button variant="outline" onClick={() => void applyTheme(null)} disabled={isApplying} className="w-full">
          {t('resetToDefault')}
        </Button>
      ) : null}
      <Button
        onClick={() => {
          if (customizer.config.id && !customizer.config.isDirty) {
            void applyTheme(customizer.config.id ?? null)
            return
          }

          setSaveDialogOpen(true)
        }}
        disabled={isApplying || currentSelectionMatchesLiveTheme}
        className="w-full"
      >
        {isApplying ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {customizer.config.id && !customizer.config.isDirty ? t('apply') : t('saveAsNewAndApply')}
      </Button>
    </div>
  )

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="full-height">
        <ResponsiveDialogContent className="flex min-h-0 flex-col overflow-hidden sm:max-h-[min(90dvh,56rem)] sm:max-w-6xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              <Palette className="size-4" />
              {t('dialogTitle')}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{t('dialogDescription')}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <ThemeWorkspace
              customizer={customizer}
              themes={themes}
              isLoading={isLoading}
              onSelectTheme={(selectedTheme) => customizer.loadTheme(selectedTheme)}
              onStartFromPreset={(preset) => customizer.startNewTheme(preset)}
              onSave={() => setSaveDialogOpen(true)}
              showDeleteThemes={false}
              previewDescription={t('sharedThemeWarning')}
              compactFooter={compactFooter}
            />
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter className="hidden gap-2 min-[1180px]:flex">
            {theme.assignedThemeId ? (
              <Button variant="outline" onClick={() => void applyTheme(null)} disabled={isApplying}>
                {t('resetToDefault')}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying || isSaving}>
              {t('cancel')}
            </Button>
            {primaryAction}
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <SaveThemeDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={(name) => handleSave(name)}
        isLoading={isSaving}
        error={saveError}
      />
    </>
  )
}
