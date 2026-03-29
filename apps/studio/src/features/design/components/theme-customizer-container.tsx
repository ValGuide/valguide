import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemePreset } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { cn } from '@valguide/ui/lib/utils'
import { Palette, Smartphone } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useOrgThemes } from '../hooks/use-org-themes'
import { useThemeCustomizer } from '../use-theme-customizer'
import { DeleteThemeDialog } from './delete-theme-dialog'
import { PlayerPreview } from './player-preview'
import { SaveThemeDialog } from './save-theme-dialog'
import { ThemeEditorPanel } from './theme-editor-panel'

export interface ThemeCustomizerContainerProps {
  className?: string
}

type ThemeCustomizerView = 'customizer' | 'preview'

export function ThemeCustomizerContainer({ className }: ThemeCustomizerContainerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const customizer = useThemeCustomizer('light')
  const { themes, isLoading, createTheme, updateTheme, deleteTheme } = useOrgThemes()

  const [activeView, setActiveView] = useState<ThemeCustomizerView>('customizer')
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

  const editorPanel = (layout: 'workspace' | 'split') => (
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
    previewClassName,
    playerClassName,
  }: {
    previewClassName?: string
    playerClassName?: string
  }) => (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold">{t('livePreview')}</h2>
        <span className="text-sm text-muted-foreground truncate">{currentThemeLabel}</span>
      </div>
      <ScrollArea className={cn('flex-1 rounded-xl border bg-muted/30 p-6 sm:p-8', previewClassName)}>
        <div className="flex min-h-full items-start justify-center">
          <PlayerPreview style={previewStyle} className={cn('w-full shadow-xl', playerClassName)} />
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className={cn('flex flex-col gap-6 w-full h-full', className)}>
      <div className="2xl:hidden w-full">
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as ThemeCustomizerView)}
          className="w-full"
        >
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
            <div className="mx-auto w-full max-w-5xl">{editorPanel('workspace')}</div>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <div className="mx-auto w-full max-w-6xl">
              {previewPanel({
                previewClassName: 'h-[calc(100vh-12rem)]',
                playerClassName: 'max-w-[28rem]',
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden 2xl:grid 2xl:grid-cols-[minmax(0,1.3fr)_minmax(440px,0.9fr)] gap-6 w-full flex-1 min-h-0">
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
