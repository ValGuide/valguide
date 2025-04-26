import { EmailLoginFlow } from '@/app/[locale]/(auth)/login/email/email-login-flow'
import { signInWithEmailAction } from '@/app/[locale]/(auth)/login/email/actions'
import { EmailLoginFormServer } from '@/app/[locale]/(auth)/login/email/email-login-form.server'
import { PageParamsWithLocale } from '@/utils/types'
import { setRequestLocale } from 'next-intl/server'
import { i18nStaticParams } from '@/i18n/i18n.config'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

const defaultRedirect = '/console'

export default async function Signin({ params }: PageParamsWithLocale) {
  const locale = (await params).locale
  setRequestLocale(locale)

  return (
    <EmailLoginFlow
      defaultRedirect={defaultRedirect}
      i18n={{} as any}
      onSubmit={signInWithEmailAction}
      emailComponent={<EmailLoginFormServer />}
    />
  )
}
