import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Clock, Loader2 } from 'lucide-react'
import { AuthLayout } from './auth-layout'

export interface PendingApprovalPageProps {
  onSignOut: () => void
  onCheckAgain: () => void
  isChecking?: boolean
}

export function PendingApprovalPage({ onSignOut, onCheckAgain, isChecking }: PendingApprovalPageProps) {
  const t = useTranslations('accountStatus')

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Clock className="size-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-3xl tracking-tight font-serif">{t('pending.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('pending.description')}</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button variant="outline" onClick={onCheckAgain} disabled={isChecking}>
            {isChecking && <Loader2 className="animate-spin" />}
            {t('pending.checkAgain')}
          </Button>
          <Button variant="ghost" onClick={onSignOut}>
            {t('pending.signOut')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
