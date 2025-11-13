'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@valguide/ui/components/dialog'
import { Button } from '@valguide/ui/components/button'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { History, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { getGuideTranslationHistory, rollbackGuideTranslation } from '../translation-actions'
import { TranslationStatusBadge } from './translation-status-badge'
import { useTranslations, useFormatter } from 'next-intl'
import type { GuideTranslationVersion } from '../schema'
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

interface VersionHistoryDialogProps {
  guideId: string
  locale: string
  onRollback?: () => void
}

export function VersionHistoryDialog({ guideId, locale, onRollback }: VersionHistoryDialogProps) {
  const t = useTranslations('guides.versionHistory')
  const format = useFormatter()
  const [isOpen, setIsOpen] = useState(false)
  const [versions, setVersions] = useState<GuideTranslationVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [isRollbackOpen, setIsRollbackOpen] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadVersions()
    }
  }, [isOpen, guideId, locale])

  const loadVersions = async () => {
    setIsLoading(true)
    try {
      const history = await getGuideTranslationHistory(guideId, locale)
      setVersions(history)
    } catch (error) {
      console.error('Failed to load version history:', error)
      toast.error(t('loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRollbackClick = (version: number) => {
    setSelectedVersion(version)
    setIsRollbackOpen(true)
  }

  const handleRollback = async () => {
    if (!selectedVersion) return

    setIsRollingBack(true)
    try {
      const result = await rollbackGuideTranslation(guideId, locale, selectedVersion)
      
      if (result.success) {
        toast.success(t('rollbackSuccess'))
        setIsRollbackOpen(false)
        setIsOpen(false)
        onRollback?.()
      } else {
        toast.error(result.error || t('rollbackError'))
      }
    } catch (error) {
      console.error('Failed to rollback:', error)
      toast.error(t('rollbackError'))
    } finally {
      setIsRollingBack(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return format.dateTime(new Date(date), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            {t('button')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">{t('loading')}</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">{t('noVersions')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {t('versionLabel')} {version.version}
                          </span>
                          <TranslationStatusBadge status={version.status} />
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{version.title}</p>
                          {version.description && (
                            <p className="text-muted-foreground line-clamp-2">{version.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{t('created')}: {formatDate(version.createdAt)}</span>
                          {version.publishedAt && (
                            <span>{t('published')}: {formatDate(version.publishedAt)}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRollbackClick(version.version)}
                        className="ml-4"
                      >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        {t('rollback')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRollbackOpen} onOpenChange={setIsRollbackOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rollbackConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('rollbackConfirmDescription', { version: selectedVersion?.toString() || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRollingBack}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollback} disabled={isRollingBack}>
              {isRollingBack ? t('rollingBack') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
