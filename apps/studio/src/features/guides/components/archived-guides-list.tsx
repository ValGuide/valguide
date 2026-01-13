import { useQueryClient } from '@tanstack/react-query'
import { Image } from '@unpic/react'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { deleteGuideFn, recoverGuideFn } from '@valguide/core/features/guides/server-functions'
import type { GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@valguide/ui/components/alert-dialog'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { StatusBadge } from '@valguide/ui/components/status-badge'
import { Archive, ImageIcon, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface ArchivedGuidesListProps {
  guides: GuideWithTranslationsAndCover[]
  userId: string
  onActionComplete?: () => void
}

type DialogState = {
  type: 'recover' | 'delete' | null
  guideId: string | null
  guideName: string | null
}

export function ArchivedGuidesList({ guides, userId: _userId, onActionComplete }: ArchivedGuidesListProps) {
  const t = useTranslations('guides')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, guideId: null, guideName: null })
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  const confirmationPhrase = t('deleteConfirmPhrase')
  const isConfirmationValid = useMemo(() => {
    return confirmationInput.trim().toLowerCase() === confirmationPhrase.trim().toLowerCase()
  }, [confirmationInput, confirmationPhrase])

  const handleDialogClose = () => {
    setDialogState({ type: null, guideId: null, guideName: null })
    setConfirmationInput('')
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
  }

  const handleRecover = async () => {
    if (!dialogState.guideId) return

    setIsLoading(true)
    try {
      await recoverGuideFn({ data: { id: dialogState.guideId } })
      toast.success(t('recover.success'), {
        description: t('recover.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['guides'] })
      await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
      onActionComplete?.()
    } catch (_error) {
      toast.error(t('recover.error'), {
        description: t('recover.errorDescription'),
      })
    } finally {
      setIsLoading(false)
      handleDialogClose()
    }
  }

  const handleDelete = async () => {
    if (!dialogState.guideId || !isConfirmationValid) return

    setIsLoading(true)
    try {
      await deleteGuideFn({ data: { id: dialogState.guideId } })
      toast.success(t('delete.success'), {
        description: t('delete.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
      onActionComplete?.()
    } catch (_error) {
      toast.error(t('delete.error'), {
        description: t('delete.errorDescription'),
      })
    } finally {
      setIsLoading(false)
      handleDialogClose()
    }
  }

  if (guides.length === 0) {
    return (
      <Empty className="border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive className="h-10 w-10 text-muted-foreground/60" />
          </EmptyMedia>
          <EmptyTitle className="text-lg">{t('noArchivedGuides')}</EmptyTitle>
          <EmptyDescription className="text-sm">{t('noArchivedGuidesDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => {
          const translation = guide.translations?.find((t) => t.locale === locale) ?? guide.translations?.[0]
          const displayTitle = getVersionedField(translation, 'title') || t('untitledGuide')
          const displayDescription = getVersionedField(translation, 'description')
          const displayImage = guide.coverImage ? getAssetImageUrl(guide.coverImage) : undefined

          return (
            <Card key={guide.id} className="flex h-full flex-col overflow-hidden">
              <div className="relative h-44 w-full shrink-0 overflow-hidden">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={displayTitle}
                    layout="fullWidth"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
                      <ImageIcon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-xs text-muted-foreground/70">{t('noCoverImage')}</p>
                  </div>
                )}
              </div>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-start justify-between gap-3">
                  <span className="line-clamp-2 flex-1 break-all text-base font-semibold leading-snug">
                    {displayTitle}
                  </span>
                  <StatusBadge status="archived" size="sm" className="mt-0.5 shrink-0">
                    {t('archivedStatus')}
                  </StatusBadge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 py-3">
                {displayDescription ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{displayDescription}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/50">{t('noDescription')}</p>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3 pt-0">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setDialogState({ type: 'recover', guideId: guide.id, guideName: displayTitle })}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    {t('recoverGuide')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDialogState({ type: 'delete', guideId: guide.id, guideName: displayTitle })}
                    className="w-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    {t('permanentlyDelete')}
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground/70">
                  {t('archivedOnDate', { date: formatDate(guide.archivedAt ?? undefined) })}
                </span>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={dialogState.type === 'recover'} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recoverConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('recoverConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecover} disabled={isLoading}>
              {isLoading ? tCommon('loading') : t('recoverGuide')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescriptionWithName', { name: dialogState.guideName ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">{t('deleteConfirmInstruction', { phrase: confirmationPhrase })}</Label>
            <Input
              id="delete-confirmation"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={confirmationPhrase}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading || !isConfirmationValid}
              variant="destructive"
            >
              {isLoading ? tCommon('loading') : t('permanentlyDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
