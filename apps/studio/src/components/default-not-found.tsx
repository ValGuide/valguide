import { useTranslations } from '@valguide/core/i18n/client'
import { NotFoundPage } from '@valguide/features/404/not-found-page'

export function DefaultNotFound() {
  const t = useTranslations('notFound')
  return <NotFoundPage i18n={{ title: t('title'), description: t('description'), homeButton: t('homeButton') }} />
}
