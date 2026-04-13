import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { generateThemeAiFn } from '@valguide/core/features/themes/generate-theme-ai.fn'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { valguideId } from '@valguide/core/utils/nanoid'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Textarea } from '@valguide/ui/components/textarea'
import { cn } from '@valguide/ui/lib/utils'
import { ImagePlus, Loader2, Sparkles, Trash2, Upload, WandSparkles } from 'lucide-react'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { uploadFile } from '@/features/assets/lib/upload'
import { useOrgThemes } from '../hooks/use-org-themes'
import { themeAiWorkspaceQueryKey, themeAiWorkspaceQueryOptions } from '../theme-ai-query-options'
import { getThemeSaveErrorMessage } from '../theme-save-errors'
import { useThemeCustomizer } from '../use-theme-customizer'
import { SaveThemeDialog } from './save-theme-dialog'
import { ThemeWorkspace } from './theme-workspace'

interface InspirationDraft {
  id: string
  file: File
  previewUrl: string
}

function getFileExtension(file: File): string {
  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName) {
    return byName
  }

  const byMime = file.type.split('/').pop()?.toLowerCase()
  return byMime || 'bin'
}

function formatRelativeDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function AiThemePage() {
  const t = useTranslations('studio.aiTheme')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: workspace } = useSuspenseQuery(themeAiWorkspaceQueryOptions())
  const { createTheme } = useOrgThemes({ enabled: false })
  const customizer = useThemeCustomizer('gallery')
  const inspirationsRef = useRef<InspirationDraft[]>([])

  const [sourceUrl, setSourceUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [inspirations, setInspirations] = useState<InspirationDraft[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [latestSummary, setLatestSummary] = useState<string | null>(null)
  const [latestHighlights, setLatestHighlights] = useState<string[]>([])
  const [latestMoodKeywords, setLatestMoodKeywords] = useState<string[]>([])

  useEffect(() => {
    inspirationsRef.current = inspirations
  }, [inspirations])

  useEffect(() => {
    return () => {
      inspirationsRef.current.forEach((inspiration) => {
        URL.revokeObjectURL(inspiration.previewUrl)
      })
    }
  }, [])

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      const themeData = customizer.getThemeData()
      return createTheme({
        name,
        ...themeData,
      })
    },
    onSuccess: () => {
      customizer.markClean()
      toast.success(t('saveSuccess'))
      setSaveDialogOpen(false)
      setSaveError(null)
      void queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
    onError: (error) => {
      setSaveError(getThemeSaveErrorMessage(error, t))
    },
  })

  const generateMutation = useMutation({
    mutationFn: async () => {
      const runNanoId = valguideId()
      const uploadedImages = []

      for (const inspiration of inspirations) {
        const fileId = valguideId()
        const extension = getFileExtension(inspiration.file)
        const storagePath = `orgs/${workspace.organizationNanoId}/theme-ai/${runNanoId}/${fileId}.${extension}`
        await uploadFile({ key: storagePath, file: inspiration.file })

        uploadedImages.push({
          storagePath,
          fileName: inspiration.file.name,
          contentType: inspiration.file.type || 'application/octet-stream',
          size: inspiration.file.size,
        })
      }

      return generateThemeAiFn({
        data: {
          runNanoId,
          sourceUrl: sourceUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          images: uploadedImages,
        },
      })
    },
    onSuccess: (result) => {
      startTransition(() => {
        customizer.loadDraftThemeConfig({
          name: result.suggestion.name,
          basePreset: result.suggestion.basePreset,
          colors: result.suggestion.colors,
          radius: result.suggestion.radius,
          fonts: result.suggestion.fonts,
        })
      })

      setLatestSummary(result.suggestion.summary)
      setLatestHighlights(result.suggestion.sourceHighlights)
      setLatestMoodKeywords(result.suggestion.moodKeywords)
      toast.success(t('generationSuccess'))
      void queryClient.invalidateQueries({ queryKey: themeAiWorkspaceQueryKey() })
    },
  })

  const canGenerate = useMemo(() => {
    return Boolean(sourceUrl.trim() || notes.trim() || inspirations.length > 0) && !generateMutation.isPending
  }, [generateMutation.isPending, inspirations.length, notes, sourceUrl])
  const hasGeneratedResult = Boolean(latestSummary)

  const generatedThemeName = customizer.config.name ?? t('generatedThemeFallback')

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) {
      return
    }

    const nextFiles = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, Math.max(0, 4 - inspirations.length))
      .map((file) => ({
        id: valguideId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }))

    setInspirations((current) => [...current, ...nextFiles].slice(0, 4))
  }

  const handleRemoveInspiration = (id: string) => {
    setInspirations((current) => {
      const match = current.find((item) => item.id === id)
      if (match) {
        URL.revokeObjectURL(match.previewUrl)
      }

      return current.filter((item) => item.id !== id)
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card className="border-border/60 bg-background/95">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-xs">
                <Sparkles className="size-3.5" />
                {t('badge')}
              </Badge>
            </div>
            <div className="space-y-1">
              <CardTitle>{t('sourceCard.title')}</CardTitle>
              <CardDescription>{t('sourceCard.description')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="theme-ai-url">{t('fields.urlLabel')}</Label>
              <Input
                id="theme-ai-url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder={t('fields.urlPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-ai-notes">{t('fields.notesLabel')}</Label>
              <Textarea
                id="theme-ai-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('fields.notesPlaceholder')}
                className="min-h-28 resize-y"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t('fields.imagesLabel')}</Label>
                <p className="text-sm text-muted-foreground">{t('fields.imagesHint')}</p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-8 text-center transition-colors',
                  inspirations.length >= 4
                    ? 'cursor-not-allowed border-border/50 bg-muted/30 opacity-60'
                    : 'hover:border-primary/40 hover:bg-muted/50',
                )}
                disabled={inspirations.length >= 4}
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                  <ImagePlus className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('fields.imagesDropzone')}</p>
                  <p className="text-xs text-muted-foreground">{t('fields.imagesLimit')}</p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(event) => {
                  handleFilesSelected(event.target.files)
                  event.currentTarget.value = ''
                }}
              />

              {inspirations.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {inspirations.map((inspiration) => (
                    <div key={inspiration.id} className="group relative overflow-hidden rounded-xl border bg-muted/20">
                      <img
                        src={inspiration.previewUrl}
                        alt={inspiration.file.name}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="space-y-1 p-3">
                        <p className="truncate text-sm font-medium">{inspiration.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.max(1, Math.round(inspiration.file.size / 1024 / 1024))} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleRemoveInspiration(inspiration.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              className="w-full gap-2"
              disabled={!canGenerate}
              onClick={() => {
                void generateMutation.mutateAsync()
              }}
            >
              {generateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <WandSparkles className="size-4" />
              )}
              <span>{generateMutation.isPending ? t('generateLoading') : t('generateAction')}</span>
            </Button>

            {generateMutation.error instanceof Error ? (
              <p className="text-sm text-destructive">{generateMutation.error.message}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t('recentRuns.title')}</CardTitle>
            <CardDescription>{t('recentRuns.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspace.recentGenerations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('recentRuns.empty')}</p>
            ) : (
              workspace.recentGenerations.map((run) => (
                <div key={run.nanoId} className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{run.themeName ?? t('recentRuns.pendingLabel')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(new Date(run.createdAt), locale)}
                      </p>
                    </div>
                    <Badge variant={run.status === 'failed' ? 'destructive' : 'outline'}>
                      {t(`recentRuns.status.${run.status}`)}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {run.summary ? <p>{run.summary}</p> : null}
                    <p>
                      {t('recentRuns.meta', {
                        sourceImageCount: String(run.sourceImageCount),
                        basePreset: run.basePreset ?? '—',
                        fontLabel: run.fontLabel ?? '—',
                      })}
                    </p>
                    {run.errorMessage ? <p className="text-destructive">{run.errorMessage}</p> : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border/60">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{customizer.config.basePreset}</Badge>
              <Badge variant="outline">{customizer.config.fonts.primary.family}</Badge>
              {latestMoodKeywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="space-y-1">
              <CardTitle>{generatedThemeName}</CardTitle>
              <CardDescription>{latestSummary ?? t('resultCard.placeholder')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestHighlights.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {latestHighlights.map((highlight) => (
                  <div key={highlight} className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {highlight}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('resultCard.emptyState')}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setSaveDialogOpen(true)}
                disabled={generateMutation.isPending || !hasGeneratedResult}
              >
                <Upload className="mr-2 size-4" />
                {t('saveAction')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="min-h-[48rem]">
          <ThemeWorkspace
            customizer={customizer}
            themes={[]}
            defaultThemeId={null}
            canManageDefaultTheme={false}
            isLoading={false}
            onSelectTheme={() => {}}
            onStartFromPreset={(preset) => customizer.startNewTheme(preset)}
            onSave={() => setSaveDialogOpen(true)}
            showDeleteThemes={false}
            mobileIntro={<p className="text-center text-sm text-muted-foreground">{t('workspaceIntro')}</p>}
          />
        </div>
      </div>

      <SaveThemeDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        existingThemeName={customizer.config.name}
        onSave={async (name) => {
          await saveMutation.mutateAsync(name)
        }}
        isLoading={saveMutation.isPending}
        error={saveError}
      />
    </div>
  )
}
