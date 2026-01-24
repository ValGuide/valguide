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

export type StopRollbackResult = { success: true } | { success: false; error?: string }

// Raw version item from server
export type StopVersionHistoryItemRaw = {
  id: string
  translationId: string
  version: number
  title: string
  description: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
}

// History result from server includes pointer IDs for deriving display status
export type StopVersionHistoryResult = {
  versions: StopVersionHistoryItemRaw[]
  currentVersionId: string | null
  draftVersionId: string | null
}

// Display item with derived status for UI
export type StopVersionHistoryItem = StopVersionHistoryItemRaw & {
  status: 'draft' | 'published' | 'archived'
}

interface VersionHistoryDialogStopProps {
  stopId: string
  locale: string
  localeName?: string
  onRollback?: () => void
  onGetHistory?: (stopId: string, locale: string) => Promise<StopVersionHistoryResult>
  onRollbackAction?: (stopId: string, locale: string, targetVersion: number) => Promise<StopRollbackResult>
}

export function VersionHistoryDialogStop({
  stopId,
  locale,
  localeName,
  onRollback,
  onGetHistory,
  onRollbackAction,
}: VersionHistoryDialogStopProps) {
  const t = useTranslations('stops.versionHistory')
  const displayLocale = localeName ?? locale.toUpperCase()
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [historyResult, setHistoryResult] = useState<StopVersionHistoryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [isRollbackOpen, setIsRollbackOpen] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)

  // Derive display status for each version from pointers
  const versions = useMemo<StopVersionHistoryItem[]>(() => {
    if (!historyResult) return []
    const { versions: rawVersions, currentVersionId, draftVersionId } = historyResult
    return rawVersions.map((v) => {
      let status: StopVersionHistoryItem['status'] = 'archived'
      if (currentVersionId === v.id) status = 'published'
      else if (draftVersionId === v.id) status = 'draft'
      return { ...v, status }
    })
  }, [historyResult])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: t changes on every render, causing infinite loops
  const loadVersions = useCallback(async () => {
    if (!onGetHistory) return
    setIsLoading(true)
    try {
      const history = await onGetHistory(stopId, locale)
      setHistoryResult(history)
    } catch (error) {
      console.error('Failed to load version history:', error)
      toast.error(t('loadError'))
    } finally {
      setIsLoading(false)
    }
  }, [stopId, locale, onGetHistory])

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
      const result = await onRollbackAction(stopId, locale, selectedVersion)

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
        <History className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">{t('button')}</span>
      </Button>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('button')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t('titleWithLocale', { locale: displayLocale })}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] sm:h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">{t('loading')}</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">{t('noVersions')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-lg border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/30 hover:border-primary/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {t('versionLabel')} {version.version}
                          </span>
                          <TranslationStatusBadge status={version.status} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm truncate">{version.title}</p>
                          {version.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{version.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                          <span>{t('created', { date: formatDate(version.createdAt) })}</span>
                          {version.publishedAt && (
                            <span className="sm:before:content-['·'] sm:before:mr-3">
                              {t('published', { date: formatDate(version.publishedAt) })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollbackClick(version.version)}
                        className="self-start shrink-0 transition-colors duration-150"
                      >
                        <RotateCcw className="mr-1.5 h-3 w-3" />
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
              {t('rollbackConfirmDescription', { version: selectedVersion?.toString() ?? '' })}
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
