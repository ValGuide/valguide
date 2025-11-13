'use client'

import { useState } from 'react'
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
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { publishGuideTranslationDraft } from '../translation-actions'
import { useTranslations } from 'next-intl'

interface PublishTranslationButtonProps {
  guideId: string
  locale: string
  hasDraft: boolean
  onPublished?: () => void
  disabled?: boolean
}

export function PublishTranslationButton({
  guideId,
  locale,
  hasDraft,
  onPublished,
  disabled,
}: PublishTranslationButtonProps) {
  const t = useTranslations('guides.publish')
  const [isOpen, setIsOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  if (!hasDraft) {
    return null
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const result = await publishGuideTranslationDraft(guideId, locale)
      
      if (result.success) {
        toast.success(t('success'))
        setIsOpen(false)
        onPublished?.()
      } else {
        toast.error(result.error || t('error'))
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
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        variant="default"
        size="sm"
      >
        <Upload className="mr-2 h-4 w-4" />
        {t('button')}
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
