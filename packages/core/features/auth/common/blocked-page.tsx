import { useTranslations } from '@valguide/core/i18n/client'
import { Avatar, AvatarFallback } from '@valguide/core/ui/components/avatar'
import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import { CheckCircle2, Circle, Heart, Mail, ShieldCheck } from 'lucide-react'
import { AuthLayout } from './auth-layout'

export interface BlockedPageProps {
  onSignOut: () => void
  supportEmail?: string
}

export function BlockedPage({ onSignOut, supportEmail = 'hello@valguide.com' }: BlockedPageProps) {
  const t = useTranslations('accountStatus')

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex w-full items-center justify-center rounded-xl border border-border/50 bg-linear-to-br from-primary/5 via-muted/30 to-background p-6">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-primary/5" />
            <div className="relative flex size-16 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50">
              <Heart className="size-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
          {t('blocked.statusLabel')}: {t('blocked.statusValue')}
        </Badge>

        <div className="text-center">
          <h2 className="font-serif text-3xl tracking-tight">{t('blocked.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('blocked.description')}</p>
        </div>

        <div className="w-full space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="space-y-2.5">
            <StepItem icon={<CheckCircle2 className="size-4 text-primary" />} text={t('blocked.stepOne')} done />
            <StepItem
              icon={<div className="size-4 animate-pulse rounded-full border-2 border-primary" />}
              text={t('blocked.stepTwo')}
            />
            <StepItem icon={<Circle className="size-4 text-muted-foreground/40" />} text={t('blocked.stepThree')} />
          </div>
        </div>

        <div className="flex w-full items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{t('blocked.trustRationale')}</p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
          <Avatar className="size-9">
            <AvatarFallback className="text-xs">VG</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">{t('blocked.teamName')}</span>
            <span className="text-xs text-muted-foreground">{t('blocked.responseTime')}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={`mailto:${supportEmail}?subject=Access%20review%20request`}>
              <Mail className="size-3.5" />
              {t('blocked.contactCta')}
            </a>
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground">
          {t('blocked.signOut')}
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
