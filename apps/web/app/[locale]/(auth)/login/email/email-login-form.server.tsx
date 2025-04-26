import { useTranslations } from 'next-intl'
import { EmailLoginForm } from './email-login-form'

export const EmailLoginFormServer = () => {
  const t = useTranslations('login')
  return (
    <EmailLoginForm
      i18n={{
        submit: t('submit'),
        serverError: t('serverError'),
        email: {
          message: t('email.message'),
          placeholder: t('email.placeholder'),
        },
      }}
    />
  )
}
