import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Separator } from '@valguide/core/ui/components/separator'
import { Heart, Mail } from 'lucide-react'
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
        <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50">
          <Heart className="size-7 text-muted-foreground" />
        </div>

        <div className="text-center">
          <h2 className="font-serif text-3xl tracking-tight">{t('blocked.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('blocked.description')}</p>
        </div>

        <p className="text-center text-sm text-muted-foreground">{t('blocked.nextStep')}</p>

        <Button variant="outline" className="w-full gap-2" asChild>
          <a href={`mailto:${supportEmail}?subject=Access%20review%20request`}>
            <Mail className="size-4" />
            {t('blocked.contactCta')}
          </a>
        </Button>

        <Separator className="w-full" />

        <Button variant="ghost" size="sm" onClick={onSignOut} className="w-full text-muted-foreground">
          {t('blocked.signOut')}
        </Button>
      </div>
    </AuthLayout>
  )
}
