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
import { Loader2 } from 'lucide-react'

interface ArchiveGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isArchiving: boolean
  onConfirm: () => Promise<void>
}

export function ArchiveGuideDialog({ open, onOpenChange, isArchiving, onConfirm }: ArchiveGuideDialogProps) {
  const t = useTranslations('guides')

  const handleArchive = async () => {
    try {
      await onConfirm()
      toast.success(t('archive.success'))
      onOpenChange(false)
    } catch (error) {
      toast.error(t('archive.error'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('archive.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('archive.confirmDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>{t('archive.cancelButton')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isArchiving}>
            {isArchiving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('archive.confirmButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
