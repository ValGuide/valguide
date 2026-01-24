import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@valguide/ui/components/dialog'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { History, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TranslationStatusBadge } from './translation-status-badge'

export type RollbackResult = { success: true } | { success: false; error?: string }

// Raw version item from server
export type VersionHistoryItemRaw = {
  id: string
  translationId: string
  version: number
  title: string | null
  description: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
}

// History result from server includes pointer IDs for deriving display status
export type VersionHistoryResult = {
  versions: VersionHistoryItemRaw[]
  currentVersionId: string | null
  draftVersionId: string | null
}

// Display item with derived status for UI
export type VersionHistoryItem = VersionHistoryItemRaw & {
  status: 'draft' | 'published' | 'archived'
}

interface VersionHistoryDialogProps {
  guideId: string
  locale: string
  localeName?: string
  onRollback?: () => void
  onGetHistory?: (guideId: string, locale: string) => Promise<VersionHistoryResult>
  onRollbackAction?: (guideId: string, locale: string, targetVersion: number) => Promise<RollbackResult>
}

export function VersionHistoryDialog({
  guideId,
  locale,
  localeName,
  onRollback,
  onGetHistory,
  onRollbackAction,
}: VersionHistoryDialogProps) {
  const t = useTranslations('guides.versionHistory')
  const displayLocale = localeName ?? locale.toUpperCase()
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [historyResult, setHistoryResult] = useState<VersionHistoryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [isRollbackOpen, setIsRollbackOpen] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)

  // Derive display status for each version from pointers
  const versions = useMemo<VersionHistoryItem[]>(() => {
    if (!historyResult) return []
    const { versions: rawVersions, currentVersionId, draftVersionId } = historyResult
    return rawVersions.map((v) => {
      let status: VersionHistoryItem['status'] = 'archived'
      if (currentVersionId === v.id) status = 'published'
      else if (draftVersionId === v.id) status = 'draft'
      return { ...v, status }
    })
  }, [historyResult])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadVersions = useCallback(async () => {
    if (!onGetHistory) return
    setIsLoading(true)
    try {
      const history = await onGetHistory(guideId, locale)
      setHistoryResult(history)
    } catch (error) {
      console.error('Failed to load version history:', error)
      toast.error(t('loadError'))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t changes on every render, causing infinite loops
  }, [guideId, locale, onGetHistory, t])

  useEffect(() => {
    if (isOpen) {
      loadVersions()
    }
  }, [isOpen, loadVersions])

  const handleRollbackClick = (version: number) => {
    setSelectedVersion(version)
    setIsRollbackOpen(true)
  }

  const handleRollback = async () => {
    if (!selectedVersion || !onRollbackAction) return

    setIsRollingBack(true)
    try {
      const result = await onRollbackAction(guideId, locale, selectedVersion)

      if (result.success) {
        toast.success(t('rollbackSuccess'))
        setIsRollbackOpen(false)
        setIsOpen(false)
        onRollback?.()
      } else {
        toast.error(result.error ?? t('rollbackError'))
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
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  if (!isMounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <History className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline">{t('button')}</span>
      </Button>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">{t('button')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t('titleWithLocale', { locale: displayLocale })}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] sm:h-[400px] pr-4">
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
                  <div key={version.id} className="rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base">
                            {t('versionLabel')} {version.version}
                          </span>
                          <TranslationStatusBadge status={version.status} />
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium truncate">{version.title}</p>
                          {version.description && (
                            <p className="text-muted-foreground line-clamp-2">{version.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span>{t('created', { date: formatDate(version.createdAt) })}</span>
                          {version.publishedAt && (
                            <span>{t('published', { date: formatDate(version.publishedAt) })}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRollbackClick(version.version)}
                        className="self-start shrink-0"
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
