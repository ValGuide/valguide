import { useTranslations } from '@valguide/core/i18n/client'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { History, MoreHorizontal, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export interface MobileMoreMenuProps {
  hasDraft: boolean
  hasPublished: boolean
  onUnpublish: () => void
  onDiscard: () => void
  onOpenVersionHistory?: () => void
}

/** Mobile dropdown menu with secondary actions (unpublish, discard, version history) */
export function MobileMoreMenu({
  hasDraft,
  hasPublished,
  onUnpublish,
  onDiscard,
  onOpenVersionHistory,
}: MobileMoreMenuProps) {
  const t = useTranslations('guides.actions')
  const tDiscard = useTranslations('guides.confirmDiscard')
  const tUnpublish = useTranslations('guides.confirmUnpublish')

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)

  const handleDiscard = () => {
    onDiscard()
    setDiscardDialogOpen(false)
  }

  const handleUnpublish = () => {
    onUnpublish()
    setUnpublishDialogOpen(false)
  }

  const canUnpublish = hasPublished
  const canDiscard = hasDraft && hasPublished

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 lg:hidden">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t('moreActions')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {canUnpublish && (
            <DropdownMenuItem
              onClick={() => setUnpublishDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              {t('unpublish')}
            </DropdownMenuItem>
          )}
          {canDiscard && (
            <DropdownMenuItem onClick={() => setDiscardDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('discardChanges')}
            </DropdownMenuItem>
          )}
          {(canUnpublish || canDiscard) && onOpenVersionHistory && <DropdownMenuSeparator />}
          {onOpenVersionHistory && (
            <DropdownMenuItem onClick={onOpenVersionHistory}>
              <History className="mr-2 h-4 w-4" />
              Version History
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDiscard('title')}</AlertDialogTitle>
            <AlertDialogDescription>{tDiscard('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDiscard('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tDiscard('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tUnpublish('title')}</AlertDialogTitle>
            <AlertDialogDescription>{tUnpublish('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tUnpublish('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnpublish}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tUnpublish('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export interface MobileSavePublishProps {
  hasDraft: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  onSave: () => void
  onPublish: () => void
  disabled?: boolean
}

/** Mobile save and publish buttons - fixed bottom bar on mobile, inline on tablet/desktop */
export function MobileSavePublish({
  hasDraft,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  disabled,
}: MobileSavePublishProps) {
  const t = useTranslations('guides.actions')

  const canPublish = hasDraft || isDirty

  const saveButton = (
    <Button variant="outline" onClick={onSave} disabled={!isDirty || isSaving || isPublishing || disabled} size="sm">
      {isSaving && !isPublishing ? t('saving') : t('save')}
    </Button>
  )

  const publishButton = (
    <Button onClick={onPublish} disabled={!canPublish || isPublishing || isSaving || disabled} size="sm">
      {isPublishing ? t('publishing') : t('publish')}
    </Button>
  )

  return (
    <>
      {/* Fixed bottom bar on mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-3 sm:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={!isDirty || isSaving || isPublishing || disabled}
            size="sm"
            className="flex-1"
          >
            {isSaving && !isPublishing ? t('saving') : t('save')}
          </Button>

          <Button
            onClick={onPublish}
            disabled={!canPublish || isPublishing || isSaving || disabled}
            size="sm"
            className="flex-1"
          >
            {isPublishing ? t('publishing') : t('publish')}
          </Button>
        </div>
      </div>

      {/* Inline buttons on tablet/desktop (sm to lg) */}
      <div className="hidden sm:flex lg:hidden items-center gap-1.5">
        {saveButton}
        {publishButton}
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
  onPublish: () => void
  onUnpublish: () => void
  onDiscard: () => void
  onOpenVersionHistory?: () => void
  disabled?: boolean
}

/** Combined mobile action bar (for backwards compatibility) */
export function MobileActionBar({
  hasDraft,
  hasPublished,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  onUnpublish,
  onDiscard,
  onOpenVersionHistory,
  disabled,
}: MobileActionBarProps) {
  return (
    <>
      <MobileMoreMenu
        hasDraft={hasDraft}
        hasPublished={hasPublished}
        onUnpublish={onUnpublish}
        onDiscard={onDiscard}
        onOpenVersionHistory={onOpenVersionHistory}
      />
      <MobileSavePublish
        hasDraft={hasDraft}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSave={onSave}
        onPublish={onPublish}
        disabled={disabled}
      />
    </>
  )
}
