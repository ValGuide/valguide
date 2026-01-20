import { NotFoundPage } from '@valguide/features/404/not-found-page'

export function DefaultNotFound() {
  return (
    <NotFoundPage
      i18n={{
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      }}
    />
  )
}
