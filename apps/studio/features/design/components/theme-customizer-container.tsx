
import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { cn } from '@valguide/ui/lib/utils'
import { Palette, Smartphone } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useOrgThemes } from '../hooks/use-org-themes'
import { useThemeCustomizer } from '../use-theme-customizer'
import { DeleteThemeDialog } from './delete-theme-dialog'
import { PlayerPreview } from './player-preview'
import { SaveThemeDialog } from './save-theme-dialog'
import { ThemeEditorPanel } from './theme-editor-panel'

export interface ThemeCustomizerContainerProps {
  organizationId: string
  className?: string
}

export function ThemeCustomizerContainer({ organizationId, className }: ThemeCustomizerContainerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const customizer = useThemeCustomizer('light')
  const { themes, isLoading, createTheme, updateTheme, deleteTheme } = useOrgThemes({ organizationId })

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

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6 w-full h-full', className)}>
      {/* Mobile: Tabs layout */}
      <div className="lg:hidden w-full">
        <Tabs defaultValue="customizer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customizer" className="gap-2">
              <Palette className="size-4" />
              <span className="hidden sm:inline">{t('customize')}</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Smartphone className="size-4" />
              <span className="hidden sm:inline">{t('preview')}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customizer" className="mt-4">
            <ThemeEditorPanel
              customizer={customizer}
              themes={themes}
              isLoading={isLoading}
              onSelectTheme={handleSelectTheme}
              onStartFromPreset={handleStartFromPreset}
              onDeleteTheme={handleOpenDeleteDialog}
              onSave={() => setSaveDialogOpen(true)}
              className="border-0 shadow-none"
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-1">
                <PlayerPreview style={previewStyle} className="max-w-md mx-auto" />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Two column layout - Preview left, Editor right */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.8fr)] gap-6 w-full flex-1 min-h-0">
        {/* Preview Panel - Left */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('livePreview')}</h2>
            <span className="text-sm text-muted-foreground">{currentThemeLabel}</span>
          </div>
          <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-6">
            <div className="flex justify-center">
              <PlayerPreview style={previewStyle} className="max-w-md w-full shadow-lg" />
            </div>
          </ScrollArea>
        </div>

        {/* Editor Panel - Right */}
        <ThemeEditorPanel
          customizer={customizer}
          themes={themes}
          isLoading={isLoading}
          onSelectTheme={handleSelectTheme}
          onStartFromPreset={handleStartFromPreset}
          onDeleteTheme={handleOpenDeleteDialog}
          onSave={() => setSaveDialogOpen(true)}
        />
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
