import { createFileRoute } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Mail } from 'lucide-react'

export const Route = createFileRoute('/_main/support')({
  component: SupportPage,
})

function SupportPage() {
  const t = useTranslations('sidebar')
  const supportEmail = clientEnv.VITE_STUDIO_SUPPORT_EMAIL

  return (
    <main className="flex min-h-full flex-1 flex-col px-6 py-8 sm:px-8">
      <article className="flex max-w-2xl flex-1 flex-col justify-center gap-6">
        <div className="space-y-3">
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{t('nav.support')}</h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t('pages.support.description', { supportEmail })}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">{t('pages.support.emailLabel')}</p>
          <Button asChild>
            <a href={`mailto:${supportEmail}`}>
              <Mail className="size-4" />
              {supportEmail}
            </a>
          </Button>
        </div>
      </article>
    </main>
  )
}
