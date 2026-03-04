import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { AuthProvider } from '@valguide/features/auth/auth-provider'
import LoginLoading from '@valguide/features/auth/login/loading'
import LoginContainer from '@valguide/features/auth/login/login-container'

export const Route = createFileRoute('/_auth/login')({
  component: () => (
    <AuthProvider>
      <MissingI18nProbe />
      <LoginContainer />
    </AuthProvider>
  ),
  pendingMinMs: 1000,
  pendingMs: 0,
  pendingComponent: LoginLoading,
})

function MissingI18nProbe() {
  const t = useTranslations('auth')
  if (!import.meta.env.PROD) return null

  return <span className="sr-only">{t('__missing_i18n_probe__' as 'title')}</span>
}
