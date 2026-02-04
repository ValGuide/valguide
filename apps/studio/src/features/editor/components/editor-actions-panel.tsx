import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { MoreHorizontal, Trash2, Upload, X } from 'lucide-react'

export interface EditorActionsPanelProps {
  hasDraft: boolean
  hasPublished: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  onSave: () => void
  onPublishClick: () => void
  onUnpublishClick: () => void
  onDiscardClick: () => void
  disabled?: boolean
  /** Hide publish/unpublish actions (e.g., for stops in tour context) */
  publishingDisabled?: boolean
  /** Message to show when publishing is disabled */
  publishingDisabledMessage?: string
}

export function EditorActionsPanel({
  hasDraft,
  hasPublished,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublishClick,
  onUnpublishClick,
  onDiscardClick,
  disabled,
  publishingDisabled,
  publishingDisabledMessage,
}: EditorActionsPanelProps) {
  const t = useTranslations('tours.actions')

  const canPublish = hasDraft || isDirty
  const canUnpublish = hasPublished
  const canDiscard = hasDraft && hasPublished

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry</h3>

      {publishingDisabled ? (
        <p className="text-sm text-muted-foreground">{publishingDisabledMessage}</p>
      ) : (
        <Button
          onClick={onPublishClick}
          disabled={!canPublish || isPublishing || isSaving || disabled}
          className="w-full shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)]"
          size="default"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isPublishing ? t('publishing') : t('publish')}
        </Button>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onSave}
          disabled={!isDirty || isSaving || isPublishing || disabled}
          className="flex-1 transition-colors duration-150"
          size="sm"
        >
          {isSaving && !isPublishing ? t('saving') : t('save')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-2.5 transition-colors duration-150">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t('moreActions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {canUnpublish && !publishingDisabled && (
              <DropdownMenuItem onClick={onUnpublishClick} className="text-destructive focus:text-destructive">
                <X className="mr-2 h-4 w-4" />
                {t('unpublish')}
              </DropdownMenuItem>
            )}
            {canDiscard && (
              <DropdownMenuItem onClick={onDiscardClick}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('discardChanges')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
