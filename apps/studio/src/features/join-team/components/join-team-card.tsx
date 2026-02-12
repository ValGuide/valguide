import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { cn } from '@valguide/ui/lib/utils'
import { AlertCircle, CheckCircle2, Mail, Users } from 'lucide-react'
import { JoinTeamOtpForm } from './join-team-otp-form'
import { SignOutButton } from './sign-out-button'

type JoinTeamCardProps = {
  variant: 'invalid' | 'accepted' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
  error?: string | null
  className?: string
  onSendOtp?: () => Promise<void>
  onVerifyOtp?: (otp: string) => Promise<void>
  onSignOut?: () => Promise<void>
}

export function JoinTeamCard({
  variant,
  invite,
  userEmail,
  error,
  className,
  onSendOtp,
  onVerifyOtp,
  onSignOut,
}: JoinTeamCardProps) {
  const t = useTranslations('joinTeam')

  if (variant === 'invalid') {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl tracking-tight">{t('invalid.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('invalid.description')}</p>
            </div>
            <p className="text-sm text-muted-foreground">{t('invalid.action')}</p>
            <Button asChild className="w-full">
              <Link to="/" preload="intent">
                {t('invalid.homeButton')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'accepted' && invite) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="size-6 text-success" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl tracking-tight">{t('accepted.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t.rich('accepted.description', {
                  teamName: invite.organization.name,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/" preload="intent">
                {t('accepted.dashboardButton')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'public' && invite && onSendOtp && onVerifyOtp) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl tracking-tight">
                {t('public.title', {
                  teamName: invite.organization.name,
                })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.rich('public.description', {
                  teamName: invite.organization.name,
                  strong1: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
            <div className="w-full rounded-md bg-muted p-4 text-center">
              <p className="mb-1 text-xs text-muted-foreground">{t('public.sentTo')}</p>
              <div className="flex items-center justify-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">{invite.email}</p>
              </div>
            </div>
            <div className="w-full">
              <JoinTeamOtpForm email={invite.email} onSendOtp={onSendOtp} onVerifyOtp={onVerifyOtp} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'wrong-account' && invite && userEmail) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl tracking-tight">{t('wrongAccount.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t.rich('wrongAccount.description', {
                  email: userEmail,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
            <div className="w-full rounded-md bg-muted p-4 text-center">
              <p className="text-sm">
                {t.rich('wrongAccount.intendedFor', {
                  email: invite.email,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{t('wrongAccount.instruction')}</p>
            <div className="flex w-full flex-col gap-3">
              {onSignOut && <SignOutButton onSignOut={onSignOut}>{t('wrongAccount.signOutButton')}</SignOutButton>}
              <Button asChild variant="ghost" className="w-full">
                <Link to="/" preload="intent">
                  {t('wrongAccount.cancelButton')}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'joining' && invite) {
    if (error) {
      return (
        <Card className={cn(className)}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <h2 className="font-serif text-2xl tracking-tight">
                {t('joining.title', {
                  teamName: invite.organization.name,
                })}
              </h2>
              <div className="w-full rounded-md bg-destructive/5 p-3 text-center text-sm text-destructive">
                {t('joining.error')}
              </div>
              <Button asChild className="w-full">
                <Link to="/" preload="intent">
                  {t('joining.dashboardButton')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={cn(className)}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-6 animate-pulse text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl tracking-tight">
                {t('joining.title', {
                  teamName: invite.organization.name,
                })}
              </h2>
              <p className="text-sm text-muted-foreground">{t('joining.description')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
