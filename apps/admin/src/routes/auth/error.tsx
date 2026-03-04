import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { AuthErrorPage, authErrorCodeToI18nKey } from '@valguide/features/auth/auth-error-page'
import { z } from 'zod'

const authErrorSearchSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
})

export const Route = createFileRoute('/auth/error')({
  validateSearch: authErrorSearchSchema,
  component: AuthErrorRoute,
})

function AuthErrorRoute() {
  const { error, error_description } = Route.useSearch()
  const t = useTranslations('authError')
  // i18n-used-keys: authError.oAuthCodeMissing, authError.sessionExpired, authError.accountNotFound, authError.accountCreationFailed, authError.originNotTrusted
  const descriptionKey = error ? authErrorCodeToI18nKey[error] : undefined

  return (
    <AuthErrorPage
      i18n={{
        title: t('title'),
        description: error_description ?? (descriptionKey ? t(descriptionKey as 'description') : t('description')),
        backToLogin: t('backToLogin'),
      }}
      errorCode={error}
    />
  )
}
