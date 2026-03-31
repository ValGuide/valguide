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
  AlertDialogTrigger,
} from '@valguide/core/ui/components/alert-dialog'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/core/ui/components/responsive-dialog'
import { useIsMobile } from '@valguide/core/ui/hooks/use-mobile'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { useState } from 'react'

export interface DeleteAccountCardProps {
  email?: string
  onDelete: () => Promise<void>
}

export function DeleteAccountCard({ email, onDelete }: DeleteAccountCardProps) {
  const t = useTranslations('profile')
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const isConfirmed = confirmText === 'DELETE'

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } catch {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setConfirmText('')
    }
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">{t('deleteAccount.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{t('deleteAccount.description')}</p>
        {isMobile ? (
          <>
            <Button variant="destructive" size="sm" onClick={() => handleOpenChange(true)}>
              {t('deleteAccount.title')}
            </Button>
            <ResponsiveDialog open={isOpen} onOpenChange={handleOpenChange} mobileVariant="full-height">
              <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-lg">
                <ResponsiveDialogHeader>
                  <ResponsiveDialogTitle>{t('deleteAccount.confirmTitle')}</ResponsiveDialogTitle>
                  <ResponsiveDialogDescription>
                    {t('deleteAccount.confirmDescription')}
                    {email && <span className="mt-2 block font-medium text-foreground">{email}</span>}
                  </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>
                <ResponsiveDialogBody className="space-y-2">
                  <p className="mb-2 text-sm text-muted-foreground">{t('deleteAccount.typeConfirm')}</p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                  />
                </ResponsiveDialogBody>
                <ResponsiveDialogFooter>
                  <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
                    {t('cancel')}
                  </Button>
                  <Button variant="destructive" disabled={!isConfirmed || isDeleting} onClick={handleDelete}>
                    {isDeleting ? t('deleteAccount.deleting') : t('deleteAccount.confirm')}
                  </Button>
                </ResponsiveDialogFooter>
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </>
        ) : (
          <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {t('deleteAccount.title')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteAccount.confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteAccount.confirmDescription')}
                  {email && <span className="mt-2 block font-medium text-foreground">{email}</span>}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <p className="text-sm text-muted-foreground mb-2">{t('deleteAccount.typeConfirm')}</p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={!isConfirmed || isDeleting}
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                >
                  {isDeleting ? t('deleteAccount.deleting') : t('deleteAccount.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  )
}
