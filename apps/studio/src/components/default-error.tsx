import type { ErrorComponentProps } from '@tanstack/react-router'
import { ErrorPage } from '@valguide/features/error/error-page'

export function DefaultError({ error, reset }: ErrorComponentProps) {
  const handleTryAgain = () => {
    reset()
    window.location.reload()
  }

  return (
    <ErrorPage
      className="min-h-full py-4 sm:py-8"
      i18n={{
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again or return to the home page.',
        tryAgain: 'Try again',
      }}
      error={error}
      reset={handleTryAgain}
    />
  )
}
