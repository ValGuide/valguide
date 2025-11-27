'use client'

import { Link } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@valguide/ui/components/card'
import { useTranslations } from 'next-intl'
import { SignOutButton } from './sign-out-button'

type JoinTeamCardProps = {
  variant: 'invalid' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
  nextUrl?: string
  error?: string | null
}

export function JoinTeamCard({
  variant,
  invite,
  userEmail,
  nextUrl = '/',
  error,
}: JoinTeamCardProps) {
  const t = useTranslations('joinTeam')

  if (variant === 'invalid') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">{t('invalid.title')}</CardTitle>
          <CardDescription>{t('invalid.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('invalid.action')}</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">{t('invalid.homeButton')}</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (variant === 'public' && invite) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {t('public.title', { teamName: invite.organization.name })}
          </CardTitle>
          <CardDescription>
            {t.rich('public.description', {
              teamName: invite.organization.name,
              strong1: (chunks) => <strong>{chunks}</strong>,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="font-medium">{t('public.invitationFor')}</p>
            <p className="text-muted-foreground">{invite.email}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('public.instruction')}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link
              href={`/signup?email=${encodeURIComponent(
                invite.email
              )}&next=${encodeURIComponent(nextUrl)}`}
            >
              {t('public.createAccount')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/login?next=${encodeURIComponent(nextUrl)}`}>
              {t('public.haveAccount')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (variant === 'wrong-account' && invite && userEmail) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('wrongAccount.title')}</CardTitle>
          <CardDescription>
            {t.rich('wrongAccount.description', {
              email: userEmail,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <p>
              {t.rich('wrongAccount.intendedFor', {
                email: invite.email,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('wrongAccount.instruction')}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SignOutButton>{t('wrongAccount.signOutButton')}</SignOutButton>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">{t('wrongAccount.cancelButton')}</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (variant === 'joining' && invite) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('joining.title')}</CardTitle>
          <CardDescription>
            {t('joining.description', { teamName: invite.organization.name })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('joining.error')}
              </p>
            </div>
          ) : (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          {error && (
            <Button asChild className="w-full">
              <Link href="/">{t('joining.dashboardButton')}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return null
}
