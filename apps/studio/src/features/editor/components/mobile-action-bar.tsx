import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { MoreHorizontal, Trash2, X } from 'lucide-react'

export interface MobileMoreMenuProps {
  hasDraft: boolean
  hasPublished: boolean
  onUnpublishClick: () => void
  onDiscardClick: () => void
  /** Hide unpublish action (e.g., for stops in tour context) */
  publishingDisabled?: boolean
}

/** Mobile dropdown menu with secondary actions (unpublish, discard) */
export function MobileMoreMenu({
  hasDraft,
  hasPublished,
  onUnpublishClick,
  onDiscardClick,
  publishingDisabled,
}: MobileMoreMenuProps) {
  const t = useTranslations('tours.actions')

  const canUnpublish = hasPublished && !publishingDisabled
  const canDiscard = hasDraft && hasPublished

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 lg:hidden">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('moreActions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        {canUnpublish && (
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
  )
}

export interface MobileSavePublishProps {
  hasDraft: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  onSave: () => void
  onPublishClick: () => void
  /** Hide publish button (e.g., for stops in tour context) */
  publishingDisabled?: boolean
}

/** Mobile save and publish buttons - fixed bottom bar on mobile, inline on tablet/desktop */
export function MobileSavePublish({
  hasDraft,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublishClick,
  publishingDisabled,
}: MobileSavePublishProps) {
  const t = useTranslations('tours.actions')

  const canPublish = hasDraft || isDirty

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-3 sm:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={!isDirty || isSaving || isPublishing}
            size="sm"
            className="flex-1"
          >
            {isSaving && !isPublishing ? t('saving') : t('save')}
          </Button>

          {!publishingDisabled && (
            <Button
              onClick={onPublishClick}
              disabled={!canPublish || isPublishing || isSaving}
              size="sm"
              className="flex-1"
            >
              {isPublishing ? t('publishing') : t('publish')}
            </Button>
          )}
        </div>
      </div>

      <div className="hidden sm:flex lg:hidden items-center gap-1.5">
        <Button variant="outline" onClick={onSave} disabled={!isDirty || isSaving || isPublishing} size="sm">
          {isSaving && !isPublishing ? t('saving') : t('save')}
        </Button>
        {!publishingDisabled && (
          <Button onClick={onPublishClick} disabled={!canPublish || isPublishing || isSaving} size="sm">
            {isPublishing ? t('publishing') : t('publish')}
          </Button>
        )}
      </div>
    </>
  )
}

export interface MobileActionBarProps {
  hasDraft: boolean
  hasPublished: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  onSave: () => void
  onPublishClick: () => void
  onUnpublishClick: () => void
  onDiscardClick: () => void
}

/** Combined mobile action bar (for backwards compatibility) */
export function MobileActionBar({
  hasDraft,
  hasPublished,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublishClick,
  onUnpublishClick,
  onDiscardClick,
}: MobileActionBarProps) {
  return (
    <>
      <MobileMoreMenu
        hasDraft={hasDraft}
        hasPublished={hasPublished}
        onUnpublishClick={onUnpublishClick}
        onDiscardClick={onDiscardClick}
      />
      <MobileSavePublish
        hasDraft={hasDraft}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSave={onSave}
        onPublishClick={onPublishClick}
      />
    </>
  )
}
