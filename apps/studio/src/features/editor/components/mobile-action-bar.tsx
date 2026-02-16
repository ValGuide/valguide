import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'

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
  )
}
