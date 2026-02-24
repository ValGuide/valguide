import { NotFoundPage } from '@valguide/features/404/not-found-page'

export function DefaultNotFound() {
    return (
        <NotFoundPage
            i18n={{
                title: 'Page not found',
                description: "The page you're looking for doesn't exist or has been moved.",
                homeButton: 'Go back',
            }}
        />
    )
}
