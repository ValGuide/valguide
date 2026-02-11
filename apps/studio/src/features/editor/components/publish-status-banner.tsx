import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { AlertTriangle, Check, EyeOff, Loader2 } from 'lucide-react'

export type PublishState = 'draft' | 'published' | 'unpublished-changes'

export type PublishStatusBannerProps = {
  state: PublishState
  publishedAt?: Date | null
  isPublishing?: boolean
  publishingDisabled?: boolean
  onPublish?: () => void
  onDiscard?: () => void
}

export function PublishStatusBanner({
  state,
  publishedAt,
  isPublishing,
  publishingDisabled,
  onPublish,
  onDiscard,
}: PublishStatusBannerProps) {
  const t = useTranslations('tours.editor')
  const formattedDate = publishedAt ? publishedAt.toLocaleDateString() : null

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
        state === 'draft' && 'bg-muted/50',
        state === 'published' && 'border-success/20 bg-success/5',
        state === 'unpublished-changes' && 'border-amber-500/20 bg-amber-500/5',
      )}
    >
      <div className="flex items-center gap-3">
        {state === 'draft' && <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" />}
        {state === 'published' && <Check className="h-4 w-4 shrink-0 text-success" />}
        {state === 'unpublished-changes' && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
        <p className="text-sm font-medium">
          {state === 'draft' && t('draft')}
          {state === 'published' && (formattedDate ? t('publishedAt', { date: formattedDate }) : t('published'))}
          {state === 'unpublished-changes' && t('visitorsSeePreviousVersion')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {state === 'draft' && !publishingDisabled && (
          <Button size="sm" onClick={onPublish} disabled={isPublishing}>
            {isPublishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('publish')}
          </Button>
        )}
        {state === 'unpublished-changes' && !publishingDisabled && (
          <>
            <Button variant="ghost" size="sm" onClick={onDiscard} disabled={isPublishing}>
              {t('discard')}
            </Button>
            <Button size="sm" onClick={onPublish} disabled={isPublishing}>
              {isPublishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t('publishChanges')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
