import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { ShieldX } from 'lucide-react'
import { AuthLayout } from './auth-layout'

export interface BlockedPageProps {
  onSignOut: () => void
}

export function BlockedPage({ onSignOut }: BlockedPageProps) {
  const t = useTranslations('accountStatus')

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <ShieldX className="size-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-3xl tracking-tight font-serif">{t('blocked.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('blocked.description')}</p>
        </div>
        <Button variant="ghost" onClick={onSignOut} className="w-full">
          {t('blocked.signOut')}
        </Button>
      </div>
    </AuthLayout>
  )
}
