import { useTranslations } from '@valguide/core/i18n/client'
import { Avatar, AvatarFallback } from '@valguide/core/ui/components/avatar'
import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import { CheckCircle2, Circle, Clock, Loader2, Mail, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
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
        <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-border/50 bg-linear-to-br from-primary/5 via-muted/30 to-background p-6">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
            {t('pending.statusLabel')}: {t('pending.statusValue')}
          </Badge>
          <div className="relative">
            <div className="absolute -inset-2 animate-[pulse_3s_ease-in-out_infinite] rounded-full bg-muted/50" />
            <div className="relative flex size-14 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50">
              <Clock className="size-7 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-serif text-3xl tracking-tight">{t('pending.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('pending.description')}</p>
        </div>

        <div className="w-full space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground">{t('pending.stepsTitle')}</p>
          <div className="space-y-0">
            <StepItem
              icon={<CheckCircle2 className="size-4 text-primary" />}
              text={t('pending.stepOne')}
              done
              showConnector
            />
            <StepItem
              icon={
                <div className="size-4 animate-[pulse_3s_ease-in-out_infinite] rounded-full border-2 border-primary" />
              }
              text={t('pending.stepTwo')}
              showConnector
            />
            <StepItem icon={<Circle className="size-4 text-muted-foreground/40" />} text={t('pending.stepThree')} />
          </div>
        </div>

        <div className="flex w-full items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{t('pending.trustRationale')}</p>
        </div>

        <p className="text-xs text-muted-foreground">{t('pending.expectation')}</p>

        <div className="flex w-full flex-col gap-2">
          <Button variant="outline" onClick={onCheckAgain} disabled={isChecking}>
            <span className="inline-flex w-4 justify-center">
              {isChecking && <Loader2 className="size-4 animate-spin" />}
            </span>
            {t('pending.checkStatus')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t('pending.autoRefreshNote')}</p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">VG</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{t('pending.teamName')}</p>
            <p className="text-xs text-muted-foreground">{t('pending.responseTime')}</p>
          </div>
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

function StepItem({
  icon,
  text,
  done,
  showConnector,
}: {
  icon: ReactNode
  text: string
  done?: boolean
  showConnector?: boolean
}) {
  return (
    <div
      className={`relative flex items-center gap-2.5 pl-7 py-1.5 ${
        showConnector
          ? 'before:absolute before:left-1.75 before:top-5 before:h-full before:w-px before:bg-border/50'
          : ''
      }`}
    >
      <div className="absolute left-0">{icon}</div>
      <span className={done ? 'text-sm text-muted-foreground' : 'text-sm'}>{text}</span>
    </div>
  )
}
