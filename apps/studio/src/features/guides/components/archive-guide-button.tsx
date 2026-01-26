import { archiveGuideFn } from '@valguide/core/features/guides/guide/archive-guide'
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
  AlertDialogTrigger,
} from '@valguide/ui/components/alert-dialog'
import { Button } from '@valguide/ui/components/button'
import { Archive, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface ArchiveGuideButtonProps {
  guideNanoId: string
  onArchived: () => void
}

export function ArchiveGuideButton({ guideNanoId, onArchived }: ArchiveGuideButtonProps) {
  const t = useTranslations('guides')
  const [isOpen, setIsOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      await archiveGuideFn({ data: { nanoId: guideNanoId } })
      toast.success(t('archive.success'))
      setIsOpen(false)
      onArchived()
    } catch (error) {
      toast.error(t('archive.error'))
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Archive className="h-4 w-4" />
          {t('archive.button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('archive.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('archive.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>{t('archive.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isArchiving}>
            {isArchiving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('archive.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
