import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import { Mail, ShieldCheck } from 'lucide-react'
import { AuthLayout } from './auth-layout'

export interface BlockedPageProps {
  onSignOut: () => void
  supportEmail?: string
  onCheckStatus?: () => Promise<void>
  isCheckingStatus?: boolean
}

export function BlockedPage({
  onSignOut,
  supportEmail = 'hello@valguide.com',
  onCheckStatus,
  isCheckingStatus = false,
}: BlockedPageProps) {
  const t = useTranslations('accountStatus')

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6">
        {/* Icon + Status */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <Badge variant="secondary" className="gap-1.5">
            {t('blocked.statusLabel')}: {t('blocked.statusValue')}
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{t('blocked.title')}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{t('blocked.description')}</p>
        </div>

        {/* Expectation - subtle box */}
        <div className="w-full max-w-sm rounded-lg bg-muted/40 px-4 py-3 border border-border/30">
          <p className="text-xs text-muted-foreground text-center font-medium">{t('blocked.expectation')}</p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm flex flex-col gap-2.5 pt-2">
          {onCheckStatus && (
            <Button onClick={onCheckStatus} disabled={isCheckingStatus} size="sm" className="gap-2">
              {isCheckingStatus && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t('blocked.checkStatus')}
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" asChild disabled={isCheckingStatus}>
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent('ValGuide access review')}&body=${encodeURIComponent(
                'Museum/Institution:\nRole/Title:\nWork Email:\n\nAdditional details:\n',
              )}`}
            >
              <Mail className="size-4" />
              {t('blocked.contactCta')}
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground">
            {t('blocked.signOut')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
