import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { FileQuestion } from 'lucide-react'

export function StopNotFound() {
  const t = useTranslations('stops')

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild variant="outline">
        <Link to="/stops">{t('notFound.backToStops')}</Link>
      </Button>
    </div>
  )
}
