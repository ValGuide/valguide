import type { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from '@valguide/core/i18n/client'
import { AuthErrorPage, type AuthErrorPageProps, authErrorCodeToI18nKey } from './auth-error-page'

function AuthErrorPageWithTranslations({ errorCode }: Pick<AuthErrorPageProps, 'errorCode'>) {
  const t = useTranslations('authError')
  const descriptionKey = errorCode ? authErrorCodeToI18nKey[errorCode] : undefined

  return (
    <AuthErrorPage
      i18n={{
        title: t('title'),
        description: descriptionKey ? t(descriptionKey as 'description') : t('description'),
        backToLogin: t('backToLogin'),
      }}
      errorCode={errorCode}
    />
  )
}

const meta: Meta<typeof AuthErrorPageWithTranslations> = {
  title: 'Core/Auth/AuthErrorPage',
  component: AuthErrorPageWithTranslations,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Full-page error screen for authentication errors (OAuth failures, untrusted origins, etc.).',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof AuthErrorPageWithTranslations>

export const Default: Story = {}

export const OAuthCodeMissing: Story = {
  args: { errorCode: 'oAuth_code_missing' },
}

export const SessionExpired: Story = {
  args: { errorCode: 'please_restart_the_process' },
}

export const OriginCheckFailed: Story = {
  args: { errorCode: 'origin_check_failed' },
}

export const UnknownError: Story = {
  args: { errorCode: 'some_unknown_code' },
}
