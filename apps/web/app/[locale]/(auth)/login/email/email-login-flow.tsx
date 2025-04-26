'use client'

import { useSearchParams } from 'next/navigation'
import { ReactNode, useCallback, useState } from 'react'
import type { EmailLoginFormProps } from './email-login-form'
import type { EmailOtpVerificationProps } from './email-otp-verification'
import { EmailOtpVerification } from '@/app/[locale]/(auth)/login/email/email-otp-verification'
import { EmailLoginProvider, OnSubmit } from './email-login.provider'

export type EmailLoginFlowProps = {
  onSubmit: OnSubmit
  defaultRedirect: string
  emailComponent: ReactNode
  i18n: {
    otp: EmailOtpVerificationProps['i18n']
    loginForm: EmailLoginFormProps['i18n']
  }
}

export const EmailLoginFlow = ({ defaultRedirect, onSubmit, i18n, emailComponent }: EmailLoginFlowProps) => {
  const redirectTo = useSearchParams().get('next') ?? defaultRedirect
  const [email, setEmail] = useState<string>('')
  const onSubmitCallback = useCallback<OnSubmit>(
    async ({ email: enteredEmail }) => {
      await onSubmit({ email: enteredEmail })
      setEmail(enteredEmail)
    },
    [onSubmit, setEmail],
  )
  return (
    <div className="min-h-dvh flex flex-1 justify-center items-center px-8">
      {email ? (
        <EmailOtpVerification email={email} i18n={i18n.otp} redirectTo={redirectTo} />
      ) : (
        <EmailLoginProvider onSubmit={onSubmitCallback}>{emailComponent}</EmailLoginProvider>
      )}
    </div>
  )
}
