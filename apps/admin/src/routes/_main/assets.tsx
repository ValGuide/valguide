import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'

export const Route = createFileRoute('/_main/assets')({
  component: AssetsPage,
})

function AssetsPage() {
  const t = useTranslations('assets')

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('comingSoon')}</p>
      </div>
    </div>
  )
}
