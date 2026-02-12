import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Clock, Loader2, Mail } from 'lucide-react'
import { AuthLayout } from './auth-layout'

export interface PendingApprovalPageProps {
  onSignOut: () => void
  onCheckAgain: () => void
  isChecking?: boolean
  supportEmail?: string
}

export function PendingApprovalPage({
  onSignOut,
  onCheckAgain,
  isChecking,
  supportEmail = 'hello@valguide.com',
}: PendingApprovalPageProps) {
  const t = useTranslations('accountStatus')

  return (
    <AuthLayout
      footer={
        <Button variant="link" size="sm" onClick={onSignOut} className="text-xs text-muted-foreground">
          {t('pending.signOut')}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Clock className="size-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl tracking-tight">{t('pending.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('pending.description')}</p>
        </div>

        <Button variant="outline" size="sm" onClick={onCheckAgain} disabled={isChecking} className="w-full">
          {isChecking && <Loader2 className="size-3.5 animate-spin" />}
          {t('pending.checkStatus')}
        </Button>

        <p className="text-xs text-muted-foreground">{t('pending.autoCheckNote')}</p>

        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          <Mail className="size-3" />
          {t('pending.contactCta')}
        </a>
      </div>
    </AuthLayout>
  )
}
