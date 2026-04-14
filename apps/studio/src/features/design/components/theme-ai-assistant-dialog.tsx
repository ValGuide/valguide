import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateThemeAiFn } from '@valguide/core/features/themes/generate-theme-ai.fn'
import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemeAiGeneratedTheme } from '@valguide/core/features/themes/theme-ai.shared'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { valguideId } from '@valguide/core/utils/nanoid'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Textarea } from '@valguide/ui/components/textarea'
import { cn } from '@valguide/ui/lib/utils'
import { ImagePlus, Loader2, Sparkles, Trash2, WandSparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadFile } from '@/features/assets/lib/upload'
import { themesQueryKey } from '../query-options'
import { themeAiWorkspaceQueryKey, themeAiWorkspaceQueryOptions } from '../theme-ai-query-options'

interface InspirationDraft {
  id: string
  file: File
  previewUrl: string
}

export interface ThemeAiAssistantResult {
  sourceUrl?: string
  notes?: string
  sourceImageCount: number
  suggestion: ThemeAiGeneratedTheme
  createdTheme: Theme
}

export interface ThemeAiAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSourceUrl?: string
  initialNotes?: string
  onGenerated: (result: ThemeAiAssistantResult) => void
}

function getFileExtension(file: File): string {
  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName) {
    return byName
  }

  const byMime = file.type.split('/').pop()?.toLowerCase()
  return byMime || 'bin'
}

function revokePreviews(inspirations: InspirationDraft[]) {
  inspirations.forEach((inspiration) => {
    URL.revokeObjectURL(inspiration.previewUrl)
  })
}

function createInspirationDraft(file: File): InspirationDraft {
  return {
    id: valguideId(),
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

export function ThemeAiAssistantDialog({
  open,
  onOpenChange,
  initialSourceUrl = '',
  initialNotes = '',
  onGenerated,
}: ThemeAiAssistantDialogProps) {
  const t = useTranslations('studio.aiTheme')
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inspirationsRef = useRef<InspirationDraft[]>([])
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl)
  const [notes, setNotes] = useState(initialNotes)
  const [inspirations, setInspirations] = useState<InspirationDraft[]>([])

  const { data: workspace } = useQuery({
    ...themeAiWorkspaceQueryOptions(),
    enabled: open,
  })

  useEffect(() => {
    inspirationsRef.current = inspirations
  }, [inspirations])

  useEffect(() => {
    if (!open) {
      return
    }

    setSourceUrl(initialSourceUrl)
    setNotes(initialNotes)
    revokePreviews(inspirationsRef.current)
    inspirationsRef.current = []
    setInspirations([])
  }, [initialNotes, initialSourceUrl, open])

  useEffect(() => {
    return () => {
      revokePreviews(inspirationsRef.current)
    }
  }, [])

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!workspace) {
        throw new Error('AI workspace data is unavailable')
      }

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

      const trimmedSourceUrl = sourceUrl.trim() || undefined
      const trimmedNotes = notes.trim() || undefined

      const result = await generateThemeAiFn({
        data: {
          runNanoId,
          sourceUrl: trimmedSourceUrl,
          notes: trimmedNotes,
          images: uploadedImages,
        },
      })

      return {
        sourceUrl: trimmedSourceUrl,
        notes: trimmedNotes,
        sourceImageCount: uploadedImages.length,
        suggestion: result.suggestion,
        createdTheme: result.createdTheme,
      } satisfies ThemeAiAssistantResult
    },
    onSuccess: (result) => {
      toast.success(t('generationSuccess'))
      void queryClient.invalidateQueries({ queryKey: themeAiWorkspaceQueryKey() })
      void queryClient.invalidateQueries({ queryKey: themesQueryKey() })
      onGenerated(result)
      onOpenChange(false)
    },
  })

  const canGenerate =
    Boolean(sourceUrl.trim() || notes.trim() || inspirations.length > 0) && !generateMutation.isPending

  const addInspirationFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        return
      }

      const nextFiles = files
        .filter((file) => file.type.startsWith('image/'))
        .slice(0, Math.max(0, 4 - inspirations.length))
        .map(createInspirationDraft)

      setInspirations((current) => [...current, ...nextFiles].slice(0, 4))
    },
    [inspirations.length],
  )

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) {
        return
      }

      addInspirationFiles(Array.from(files))
    },
    [addInspirationFiles],
  )

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!open || generateMutation.isPending || inspirations.length >= 4) {
        return
      }

      const pastedImages = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null)

      if (pastedImages.length === 0) {
        return
      }

      event.preventDefault()
      addInspirationFiles(pastedImages)
    },
    [addInspirationFiles, generateMutation.isPending, inspirations.length, open],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste, open])

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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent className="flex min-h-0 max-h-[min(92vh,56rem)] flex-col overflow-hidden sm:max-w-xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t('sourceCard.title')}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{t('sourceCard.description')}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-0 flex-col gap-6 pr-1">
            <div className="rounded-2xl border bg-muted/15 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-xs">
                  <Sparkles className="size-3.5" />
                  {t('badge')}
                </Badge>
              </div>

              <div className="space-y-5">
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
                        <div
                          key={inspiration.id}
                          className="group relative overflow-hidden rounded-xl border bg-muted/20"
                        >
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
              </div>
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generateMutation.isPending}
          >
            {t('cancelAction')}
          </Button>
          <Button
            type="button"
            className="gap-2"
            disabled={!canGenerate || !workspace}
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
        </ResponsiveDialogFooter>

        {generateMutation.error instanceof Error ? (
          <div className="px-6 pb-4 text-sm text-destructive">{generateMutation.error.message}</div>
        ) : null}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
