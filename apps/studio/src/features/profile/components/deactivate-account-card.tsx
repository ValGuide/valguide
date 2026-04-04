import { clientEnv } from '@valguide/core/env/client'
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

export interface DeactivateAccountCardProps {
  email?: string
  onDeactivate: () => Promise<void>
}

export function DeactivateAccountCard({ email, onDeactivate }: DeactivateAccountCardProps) {
  const t = useTranslations('profile')
  const supportEmail = clientEnv.VITE_STUDIO_SUPPORT_EMAIL
  const [confirmText, setConfirmText] = useState('')
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const isConfirmed = confirmText === 'DEACTIVATE'

  const handleDeactivate = async () => {
    setIsDeactivating(true)
    try {
      await onDeactivate()
    } catch {
      setIsDeactivating(false)
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
        <CardTitle className="text-destructive">{t('deactivateAccount.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <p>{t('deactivateAccount.description')}</p>
          <p>{t('deactivateAccount.contentRetained')}</p>
          <p>{t('deactivateAccount.hardDeleteHint')}</p>
          <a href={`mailto:${supportEmail}`} className="inline-flex underline-offset-4 hover:underline">
            {supportEmail}
          </a>
        </div>
        {isMobile ? (
          <>
            <Button variant="destructive" size="sm" onClick={() => handleOpenChange(true)}>
              {t('deactivateAccount.title')}
            </Button>
            <ResponsiveDialog open={isOpen} onOpenChange={handleOpenChange} mobileVariant="full-height">
              <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-lg">
                <ResponsiveDialogHeader>
                  <ResponsiveDialogTitle>{t('deactivateAccount.confirmTitle')}</ResponsiveDialogTitle>
                  <ResponsiveDialogDescription>
                    {t('deactivateAccount.confirmDescription')}
                    {email && <span className="mt-2 block font-medium text-foreground">{email}</span>}
                  </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>
                <ResponsiveDialogBody className="space-y-2">
                  <p className="mb-2 text-sm text-muted-foreground">{t('deactivateAccount.typeConfirm')}</p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DEACTIVATE"
                    autoComplete="off"
                  />
                </ResponsiveDialogBody>
                <ResponsiveDialogFooter>
                  <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeactivating}>
                    {t('cancel')}
                  </Button>
                  <Button variant="destructive" disabled={!isConfirmed || isDeactivating} onClick={handleDeactivate}>
                    {isDeactivating ? t('deactivateAccount.deactivating') : t('deactivateAccount.confirm')}
                  </Button>
                </ResponsiveDialogFooter>
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </>
        ) : (
          <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {t('deactivateAccount.title')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deactivateAccount.confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deactivateAccount.confirmDescription')}
                  {email && <span className="mt-2 block font-medium text-foreground">{email}</span>}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <p className="text-sm text-muted-foreground mb-2">{t('deactivateAccount.typeConfirm')}</p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DEACTIVATE"
                  autoComplete="off"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeactivating}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={!isConfirmed || isDeactivating}
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeactivate()
                  }}
                >
                  {isDeactivating ? t('deactivateAccount.deactivating') : t('deactivateAccount.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  )
}
