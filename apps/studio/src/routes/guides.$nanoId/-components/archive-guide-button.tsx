import { useRouter } from '@tanstack/react-router'
import { archiveGuideFn } from '@valguide/core/features/guides/actions'
import { useTranslations } from '@valguide/core/i18n/mock'
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
import { Archive } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ArchiveGuideButtonProps {
  guideId: string
}

export function ArchiveGuideButton({ guideId }: ArchiveGuideButtonProps) {
  const [open, setOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const router = useRouter()
  const t = useTranslations('guides.archive')

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      await archiveGuideFn({ data: { id: guideId } })
      toast.success(t('success'), {
        description: t('successDescription'),
      })
      router.navigate({ to: '/' })
      router.invalidate()
    } catch (_error) {
      toast.error(t('error'), {
        description: t('errorDescription'),
      })
    } finally {
      setIsArchiving(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Archive />
        <span className="hidden sm:inline">{t('button')}</span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>{t('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isArchiving}>
              {isArchiving ? '...' : t('confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
