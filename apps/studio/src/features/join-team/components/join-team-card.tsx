import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { AlertCircle, Mail, UserPlus, Users } from 'lucide-react'
import { JoinTeamOtpForm } from './join-team-otp-form'
import { SignOutButton } from './sign-out-button'

type JoinTeamCardProps = {
  variant: 'invalid' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
  error?: string | null
  onSendOtp?: () => Promise<void>
  onVerifyOtp?: (otp: string) => Promise<void>
  onSignOut?: () => Promise<void>
}

export function JoinTeamCard({
  variant,
  invite,
  userEmail,
  error,
  onSendOtp,
  onVerifyOtp,
  onSignOut,
}: JoinTeamCardProps) {
  const t = useTranslations('joinTeam')

  if (variant === 'invalid') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle>{t('invalid.title')}</CardTitle>
          <CardDescription>{t('invalid.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('invalid.action')}</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/" preload="intent">
              {t('invalid.homeButton')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (variant === 'public' && invite && onSendOtp && onVerifyOtp) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>
            {t('public.title', {
              teamName: invite.organization.name,
            })}
          </CardTitle>
          <CardDescription>
            {t.rich('public.description', {
              teamName: invite.organization.name,
              strong1: (chunks) => <strong>{chunks}</strong>,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="mb-1 text-xs text-muted-foreground">{t('public.sentTo')}</p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{invite.email}</p>
            </div>
          </div>
          <JoinTeamOtpForm email={invite.email} onSendOtp={onSendOtp} onVerifyOtp={onVerifyOtp} />
        </CardContent>
      </Card>
    )
  }

  if (variant === 'wrong-account' && invite && userEmail) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <CardTitle>{t('wrongAccount.title')}</CardTitle>
          <CardDescription>
            {t.rich('wrongAccount.description', {
              email: userEmail,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm">
              {t.rich('wrongAccount.intendedFor', {
                email: invite.email,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{t('wrongAccount.instruction')}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {onSignOut && <SignOutButton onSignOut={onSignOut}>{t('wrongAccount.signOutButton')}</SignOutButton>}
          <Button asChild variant="ghost" className="w-full">
            <Link to="/" preload="intent">
              {t('wrongAccount.cancelButton')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (variant === 'joining' && invite) {
    return (
      <Card className="w-full max-w-md">
        {error ? (
          <>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle>
                {t('joining.title', {
                  teamName: invite.organization.name,
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{t('joining.error')}</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/" preload="intent">
                  {t('joining.dashboardButton')}
                </Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 animate-pulse text-primary" />
            </div>
            <p className="text-lg font-medium">
              {t('joining.title', {
                teamName: invite.organization.name,
              })}
            </p>
            <p className="mt-1 text-center text-sm text-muted-foreground">{t('joining.description')}</p>
          </CardContent>
        )}
      </Card>
    )
  }

  return null
}
