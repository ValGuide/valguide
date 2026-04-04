import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { CircleOff, Clock, Loader2, Mail, ShieldAlert } from 'lucide-react'
import { AuthLayout } from './auth-layout'

export type AccountStatusPageVariant = 'pending' | 'blocked' | 'deactivated'

export interface AccountStatusPageProps {
  variant: AccountStatusPageVariant
  onSignOut: () => void
  onCheckAgain?: () => void
  isChecking?: boolean
  supportEmail: string
  userEmail: string
}

const statusIcons = {
  pending: Clock,
  blocked: ShieldAlert,
  deactivated: CircleOff,
} as const

export function AccountStatusPage({
  variant,
  onSignOut,
  onCheckAgain,
  isChecking,
  supportEmail,
  userEmail,
}: AccountStatusPageProps) {
  const t = useTranslations('accountStatus')
  const StatusIcon = statusIcons[variant]
  const showCheckAgain = variant === 'pending' && !!onCheckAgain

  return (
    <AuthLayout
      footer={
        <Button variant="link" size="sm" onClick={onSignOut} className="text-xs text-muted-foreground">
          {t(`${variant}.signOut`)}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <StatusIcon className="size-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl tracking-tight">{t(`${variant}.title`)}</h2>
          <p className="text-sm text-muted-foreground">{t(`${variant}.description`)}</p>
        </div>

        {showCheckAgain && (
          <Button variant="outline" size="sm" onClick={onCheckAgain} disabled={isChecking} className="w-full">
            {isChecking && <Loader2 className="size-3.5 animate-spin" />}
            {t('pending.checkStatus')}
          </Button>
        )}

        <p className="text-xs text-muted-foreground">{t(`${variant}.signedInAs`, { email: userEmail })}</p>

        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          <Mail className="size-3" />
          {t(`${variant}.contactCta`)}
        </a>
      </div>
    </AuthLayout>
  )
}
