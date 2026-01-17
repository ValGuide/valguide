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

  const canPublish = hasDraft || isDirty
  const canUnpublish = hasPublished
  const canDiscard = hasDraft && hasPublished

  return (
    <>
      {/* Inline action buttons for mobile header - only visible on mobile */}
      <div className="flex items-center gap-1.5 lg:hidden">
        {/* Save button */}
        <Button
          variant="outline"
          onClick={onSave}
          disabled={!isDirty || isSaving || isPublishing || disabled}
          size="sm"
        >
          {isSaving && !isPublishing ? t('saving') : t('save')}
        </Button>

        {/* Publish button - primary action */}
        <Button onClick={onPublish} disabled={!canPublish || isPublishing || isSaving || disabled} size="sm">
          {isPublishing ? t('publishing') : t('publish')}
        </Button>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t('moreActions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
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
      </div>

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
