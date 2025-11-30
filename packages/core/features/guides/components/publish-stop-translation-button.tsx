'use client'

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
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { publishStopTranslationDraft } from '../translation-actions'

interface PublishStopTranslationButtonProps {
  stopId: string
  locale: string
  hasDraft: boolean
  onPublished?: () => void
  disabled?: boolean
}

export function PublishStopTranslationButton({
  stopId,
  locale,
  hasDraft,
  onPublished,
  disabled,
}: PublishStopTranslationButtonProps) {
  const t = useTranslations('stops.publish')
  const [isOpen, setIsOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  if (!hasDraft) {
    return null
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const result = await publishStopTranslationDraft(stopId, locale)

      if (result.success) {
        toast.success(t('success'))
        setIsOpen(false)
        onPublished?.()
      } else {
        toast.error(result.error ?? t('error'))
      }
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('error'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={disabled} variant="default" size="sm">
        <Upload className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">{t('button')}</span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? t('publishing') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
