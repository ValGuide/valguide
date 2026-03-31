import { useNavigate } from '@tanstack/react-router'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { Image } from '@valguide/ui/components/image'
import { Progress } from '@valguide/ui/components/progress'
import { cn } from '@valguide/ui/lib/utils'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Music,
  RefreshCcw,
  Video,
  X,
} from 'lucide-react'
import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { getUploadCounts, isTerminalUploadStatus } from './asset-upload-session.utils'
import { useAssetUploadSession } from './asset-upload-session-context'

function AssetUploadSurfaceRow({
  item,
  onDismiss,
  onRetry,
}: {
  item: ReturnType<typeof useAssetUploadSession>['items'][number]
  onDismiss: (itemId: string) => void
  onRetry: (itemId: string) => void
}) {
  const t = useTranslations('assets.uploadSurface')
  const navigate = useNavigate()

  const icon =
    item.type === 'image' ? (
      <ImageIcon className="h-4 w-4 text-muted-foreground" />
    ) : item.type === 'audio' ? (
      <Music className="h-4 w-4 text-muted-foreground" />
    ) : item.type === 'document' ? (
      <FileText className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Video className="h-4 w-4 text-muted-foreground" />
    )

  const statusLabel =
    item.status === 'queued'
      ? t('status.queued')
      : item.status === 'uploading'
        ? t('status.uploading')
        : item.status === 'confirming'
          ? t('status.confirming')
          : item.status === 'complete'
            ? t('status.complete')
            : t('status.error')

  const secondaryLabel =
    item.status === 'uploading' || item.status === 'confirming'
      ? t('progressLabel', { progress: Math.round(item.progress) })
      : item.status === 'queued'
        ? t('status.queued')
        : null

  const handleViewAsset = () => {
    if (!item.asset) {
      return
    }

    void navigate({
      to: '/assets',
      search: {
        asset: item.asset.nanoId,
      },
    })
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-3 py-3 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {item.status === 'complete' && item.asset && item.type === 'image' ? (
          <Image
            src={getAssetImageUrl(item.asset)}
            alt={item.asset.fileName}
            layout="fullWidth"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : item.previewUrl ? (
          <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
        ) : (
          icon
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" title={item.file.name}>
              {item.file.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{item.status === 'complete' ? t('uploadedToLibrary') : statusLabel}</span>
              {secondaryLabel ? <span>{secondaryLabel}</span> : null}
            </div>
          </div>

          {item.status === 'error' ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onRetry(item.id)} className="h-8 rounded-lg px-2">
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                {t('retry')}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDismiss(item.id)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : isTerminalUploadStatus(item.status) ? (
            <div className="flex shrink-0 items-center gap-1">
              {item.status === 'complete' && item.asset ? (
                <Button variant="ghost" size="sm" onClick={handleViewAsset} className="h-8 rounded-lg px-2">
                  {t('viewAsset')}
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" onClick={() => onDismiss(item.id)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-1 text-muted-foreground">
              {item.status === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
            </div>
          )}
        </div>

        {item.status === 'error' && item.error ? (
          <p className="mt-3 rounded-xl border border-destructive/15 bg-destructive/5 px-3 py-2 text-xs leading-5 text-destructive break-words [overflow-wrap:anywhere]">
            {item.error}
          </p>
        ) : null}

        {item.status === 'uploading' || item.status === 'confirming' ? (
          <Progress value={item.progress} className="mt-3 h-1.5" />
        ) : null}
      </div>
    </div>
  )
}

function useUploadSurfaceSummary(items: ReturnType<typeof useAssetUploadSession>['items']) {
  const t = useTranslations('assets.uploadSurface')

  return React.useMemo(() => {
    const counts = getUploadCounts(
      items.map((item) => ({
        status: item.status,
        progress: item.progress,
        type: item.type,
      })),
    )

    if (counts.active > 0 || counts.queued > 0) {
      return {
        title: t('summary.uploading', { count: counts.active + counts.queued }),
        description: t('summary.inProgress'),
      }
    }

    if (counts.error > 0 && counts.complete > 0) {
      return {
        title: t('summary.partial', { complete: counts.complete, failed: counts.error }),
        description: t('summary.needsAttention'),
      }
    }

    if (counts.error > 0) {
      return {
        title: t('summary.failed', { count: counts.error }),
        description: t('summary.needsAttention'),
      }
    }

    return {
      title: t('summary.complete', { count: counts.complete }),
      description: t('summary.ready'),
    }
  }, [items, t])
}

export function AssetsUploadSurface() {
  const t = useTranslations('assets.uploadSurface')
  const isMobile = useIsMobile()
  const { items, isExpanded, setExpanded, closeSurface, dismissItem, retryItem, hasVisibleUploads } =
    useAssetUploadSession()

  const summary = useUploadSurfaceSummary(items)

  const sortedItems = React.useMemo(() => {
    return [...items].sort((left, right) => {
      const rank = (status: typeof left.status) => {
        switch (status) {
          case 'uploading':
          case 'confirming':
            return 0
          case 'queued':
            return 1
          case 'error':
            return 2
          case 'complete':
            return 3
        }
      }

      return rank(left.status) - rank(right.status) || right.createdAt - left.createdAt
    })
  }, [items])

  if (!hasVisibleUploads) {
    return null
  }

  if (isMobile) {
    return (
      <>
        {!isExpanded ? (
          <div
            data-upload-surface
            className="pointer-events-auto fixed inset-x-0 bottom-0 z-[70] border-t bg-background/98 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => setExpanded(true)}
                aria-label={t('open')}
              >
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-medium">
                  {summary.title}
                </Badge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{summary.description}</p>
                </div>
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl"
                onClick={closeSurface}
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <Drawer open={isExpanded} onOpenChange={setExpanded}>
          <DrawerContent className="max-h-[min(82dvh,calc(100dvh-1rem))]">
            <DrawerHeader className="text-left">
              <DrawerTitle>{summary.title}</DrawerTitle>
              <DrawerDescription>{summary.description}</DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[50dvh] overflow-y-auto px-4 pb-4">
              <div className="space-y-3 pb-4 pr-1">
                {sortedItems.map((item) => (
                  <AssetUploadSurfaceRow key={item.id} item={item} onDismiss={dismissItem} onRetry={retryItem} />
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <div
      data-upload-surface
      className="pointer-events-auto fixed right-4 bottom-4 z-[70] w-[24rem] max-w-[calc(100vw-2rem)]"
    >
      <div className="overflow-hidden rounded-2xl border bg-background/98 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{summary.title}</p>
            <p className="truncate text-xs text-muted-foreground">{summary.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setExpanded(!isExpanded)}
              aria-label={isExpanded ? t('collapse') : t('expand')}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={closeSurface}
              aria-label={t('close')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-out',
            isExpanded ? 'max-h-[30rem]' : 'max-h-0',
          )}
        >
          <div className="flex max-h-[30rem] min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3 pr-1">
                {sortedItems.map((item) => (
                  <AssetUploadSurfaceRow key={item.id} item={item} onDismiss={dismissItem} onRetry={retryItem} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
