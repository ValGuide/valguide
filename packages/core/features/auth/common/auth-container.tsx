'use client'

import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { MessageAlert } from './message-alert'
import { AuthLayout } from './auth-layout'
import { OtpVerificationForm } from '../otp/otp-verification-form'
import { AuthForm } from '../auth-form'
import { Consent } from '../consent'

export interface AuthContainerProps {
  // Auth state and handlers
  email: string
  setEmail: (email: string) => void
  otp: string
  setOtp: (otp: string) => void
  handleEmailAuth: (email: string) => void
  handleVerifyOtp: (e: React.FormEvent) => void
  handleResendOtp: () => void
  loading: boolean
  message: { type: 'success' | 'error'; text: string } | null
  verifyingOtp: boolean
  isLogin: boolean
}

export function AuthContainer({
  // Auth state and handlers
  email,
  setEmail,
  otp,
  setOtp,
  handleEmailAuth,
  handleVerifyOtp,
  handleResendOtp,
  loading,
  message,
  verifyingOtp,
  isLogin,
}: AuthContainerProps) {
  const t = useTranslations(isLogin ? 'login' : 'signup')

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col justify-center">
        {verifyingOtp ? (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
            <p className="mt-2 text-sm text-gray-600">{email ? `${t('verifyEmail')} ${email}` : t('checkEmail')}</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t(isLogin ? 'loginPrompt' : 'signupPrompt')}</p>
          </div>
        )}
        {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}
        {verifyingOtp ? (
          <OtpVerificationForm
            otp={otp}
            onOtpChange={(e) => setOtp(e.target.value)}
            onSubmit={handleVerifyOtp}
            onResendClick={handleResendOtp}
            loading={loading}
            isLogin={isLogin}
          />
        ) : (
          <AuthForm
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleEmailAuth}
            loading={loading}
            submitText={t('sendCode')}
            loadingText={t('sending')}
            emailLabel={t('emailLabel')}
            emailPlaceholder={t('emailPlaceholder')}
            isLogin={isLogin}
          />
        )}
      </div>
      <Consent />
    </AuthLayout>
  )
}
