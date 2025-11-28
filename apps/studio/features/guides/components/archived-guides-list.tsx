'use client'

import { deleteGuide, recoverGuide } from '@valguide/core/features/guides/actions'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { useRouter } from '@valguide/i18n/routing'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { Archive, RotateCcw, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface ArchivedGuidesListProps {
  guides: GuideWithTranslations[]
  userId: string
  onActionComplete?: () => void
}

type DialogState = {
  type: 'recover' | 'delete' | null
  guideId: string | null
}

export function ArchivedGuidesList({ guides, userId, onActionComplete }: ArchivedGuidesListProps) {
  const t = useTranslations('guides')
  const locale = useLocale()
  const router = useRouter()
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, guideId: null })
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
  }

  const handleRecover = async () => {
    if (!dialogState.guideId) return

    setIsLoading(true)
    try {
      await recoverGuide({ id: dialogState.guideId, userId })
      toast.success(t('recover.success'), {
        description: t('recover.successDescription'),
      })
      router.refresh()
      onActionComplete?.()
    } catch (_error) {
      toast.error(t('recover.error'), {
        description: t('recover.errorDescription'),
      })
    } finally {
      setIsLoading(false)
      setDialogState({ type: null, guideId: null })
    }
  }

  const handleDelete = async () => {
    if (!dialogState.guideId) return

    setIsLoading(true)
    try {
      await deleteGuide({ id: dialogState.guideId, userId })
      toast.success(t('delete.success'), {
        description: t('delete.successDescription'),
      })
      router.refresh()
      onActionComplete?.()
    } catch (_error) {
      toast.error(t('delete.error'), {
        description: t('delete.errorDescription'),
      })
    } finally {
      setIsLoading(false)
      setDialogState({ type: null, guideId: null })
    }
  }

  if (guides.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive />
          </EmptyMedia>
          <EmptyTitle>{t('noArchivedGuides')}</EmptyTitle>
          <EmptyDescription>{t('noArchivedGuidesDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {guides.map((guide) => {
          const translation = guide.translations?.find((t) => t.locale === locale) || guide.translations?.[0]
          const displayTitle =
            translation?.currentVersion?.title ?? translation?.draftVersion?.title ?? 'Untitled Guide'
          const displayDescription =
            translation?.currentVersion?.description ?? translation?.draftVersion?.description ?? ''
          const displayImage = guide.coverImage

          return (
            <Card key={guide.id} className="flex flex-col">
              {displayImage && (
                <div className="relative h-32 w-full overflow-hidden sm:h-48">
                  {/* biome-ignore lint/performance/noImgElement: Using img for dynamic content */}
                  <img src={displayImage} alt={displayTitle} className="h-full w-full object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="truncate">{displayTitle}</CardTitle>
                {displayDescription && <CardDescription className="line-clamp-2">{displayDescription}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t('archivedOn')}: {formatDate(guide.archivedAt ?? undefined)}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setDialogState({ type: 'recover', guideId: guide.id })}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw />
                  {t('recover')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDialogState({ type: 'delete', guideId: guide.id })}
                  className="w-full sm:w-auto"
                >
                  <Trash2 />
                  {t('permanentlyDelete')}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <AlertDialog
        open={dialogState.type === 'recover'}
        onOpenChange={() => setDialogState({ type: null, guideId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recoverConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('recoverConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecover} disabled={isLoading}>
              {isLoading ? '...' : t('recover')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialogState.type === 'delete'}
        onOpenChange={() => setDialogState({ type: null, guideId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? '...' : t('permanentlyDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
