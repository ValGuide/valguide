import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import { Separator } from '@valguide/core/ui/components/separator'
import { CheckCircle2, Circle, Clock, Loader2, Mail } from 'lucide-react'
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
    <AuthLayout>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
          {t('pending.statusLabel')}: {t('pending.statusValue')}
        </Badge>

        <div className="relative">
          <div className="absolute -inset-2 animate-pulse rounded-full bg-muted/50" />
          <div className="relative flex size-14 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50">
            <Clock className="size-7 text-muted-foreground" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-serif text-3xl tracking-tight">{t('pending.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('pending.description')}</p>
        </div>

        <div className="w-full space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t('pending.stepsTitle')}</p>
          <div className="space-y-2.5">
            <StepItem icon={<CheckCircle2 className="size-4 text-primary" />} text={t('pending.stepOne')} done />
            <StepItem
              icon={<div className="size-4 animate-pulse rounded-full border-2 border-primary" />}
              text={t('pending.stepTwo')}
            />
            <StepItem icon={<Circle className="size-4 text-muted-foreground/40" />} text={t('pending.stepThree')} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{t('pending.expectation')}</p>

        <Separator className="w-full" />

        <div className="flex w-full flex-col gap-2">
          <Button variant="outline" onClick={onCheckAgain} disabled={isChecking}>
            <span className="inline-flex w-4 justify-center">
              {isChecking && <Loader2 className="size-4 animate-spin" />}
            </span>
            {t('pending.checkStatus')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t('pending.autoRefreshNote')}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">{t('pending.contactPrompt')}</p>
          <Button variant="link" size="sm" className="h-auto gap-1.5 p-0 text-xs" asChild>
            <a href={`mailto:${supportEmail}`}>
              <Mail className="size-3.5" />
              {t('pending.contactCta')}
            </a>
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground">
          {t('pending.signOut')}
        </Button>
      </div>
    </AuthLayout>
  )
}

function StepItem({ icon, text, done }: { icon: React.ReactNode; text: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className={done ? 'text-sm text-muted-foreground' : 'text-sm'}>{text}</span>
    </div>
  )
}
