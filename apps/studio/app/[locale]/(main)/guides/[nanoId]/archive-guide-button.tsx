'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@valguide/ui/components/button'
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
import { Archive } from 'lucide-react'
import { toast } from 'sonner'
import { archiveGuide } from '@valguide/core/features/guides/actions'

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
      await archiveGuide({ id: guideId })
      toast.success(t('success'), {
        description: t('successDescription'),
      })
      router.push('/')
      router.refresh()
    } catch (error) {
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
        {t('button')}
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
