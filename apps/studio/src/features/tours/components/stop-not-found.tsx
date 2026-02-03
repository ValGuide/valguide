import { Link, useParams } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ArrowLeft, MapPin } from 'lucide-react'

export function StopNotFound() {
  const { nanoId } = useParams({ from: '/_main/tours/$nanoId' })
  const t = useTranslations('notFound.stop')

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <MapPin className="size-8 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-2 max-w-md text-center text-muted-foreground">{t('description')}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/tours/$nanoId/edit" params={{ nanoId }}>
            <ArrowLeft className="mr-2 size-4" />
            {t('backToTour')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
