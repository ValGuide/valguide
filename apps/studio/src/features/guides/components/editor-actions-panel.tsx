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
import { History, MoreHorizontal, Trash2, Upload, X } from 'lucide-react'
import { useState } from 'react'

export interface EditorActionsPanelProps {
  contentType: 'guide' | 'stop'
  hasDraft: boolean
  hasPublished: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  onSave: () => void
  onPublish: () => void
  onUnpublish: () => void
  onDiscard: () => void
  onOpenVersionHistory: () => void
  disabled?: boolean
}

export function EditorActionsPanel({
  contentType,
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
}: EditorActionsPanelProps) {
  const t = useTranslations('guides.actions')
  const tDiscard = useTranslations('guides.confirmDiscard')
  const tUnpublishGuide = useTranslations('guides.confirmUnpublishGuide')
  const tUnpublishStop = useTranslations('guides.confirmUnpublishStop')
  const tUnpublish = contentType === 'guide' ? tUnpublishGuide : tUnpublishStop

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
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry</h3>

      {/* Primary CTA - Publish - Made more prominent */}
      <Button
        onClick={onPublish}
        disabled={!canPublish || isPublishing || isSaving || disabled}
        className="w-full shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)]"
        size="default"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isPublishing ? t('publishing') : t('publish')}
      </Button>

      {/* Secondary actions row */}
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
            {(canUnpublish || canDiscard) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={onOpenVersionHistory}>
              <History className="mr-2 h-4 w-4" />
              Version History
            </DropdownMenuItem>
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
    </div>
  )
}
