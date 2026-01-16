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
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@valguide/core/ui/components/sonner/state'

export type PublishTranslationResult = { success: true } | { success: false; error?: string }

interface PublishTranslationButtonProps {
  guideId: string
  locale: string
  localeName?: string
  hasDraft: boolean
  onPublished?: () => void
  disabled?: boolean
  onPublishAction?: (guideId: string, locale: string) => Promise<PublishTranslationResult>
}

export function PublishTranslationButton({
  guideId,
  locale,
  localeName,
  hasDraft,
  onPublished,
  disabled,
  onPublishAction,
}: PublishTranslationButtonProps) {
  const t = useTranslations('guides.publish')
  const [isOpen, setIsOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const displayLocale = localeName ?? locale.toUpperCase()

  if (!hasDraft) {
    return null
  }

  const handlePublish = async () => {
    if (!onPublishAction) return
    setIsPublishing(true)
    try {
      const result = await onPublishAction(guideId, locale)

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
      <Button onClick={() => setIsOpen(true)} disabled={disabled} variant="default" size="sm">
        <Upload className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline">{t('buttonWithLocale', { locale: displayLocale })}</span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmTitleWithLocale', { locale: displayLocale })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDescriptionWithLocale', { locale: displayLocale })}
            </AlertDialogDescription>
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
