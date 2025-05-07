'use client'

import { useTranslations } from 'next-intl'
import { MessageAlert } from '../common/message-alert'
import { AuthLayout } from '../common/auth-layout'
import { useAuth } from '../auth-provider'
import { OtpVerificationForm } from './otp-verification-form'
import { AuthForm } from '../auth-form'
import { Consent } from '../consent'

export default function LoginContainer() {
  const t = useTranslations('login')
  const {
    handleEmailAuth,
    handleVerifyOtp,
    otp,
    setOtp,
    handleResendOtp,
    loading,
    message,
    verifyingOtp,
    email,
    setEmail,
  } = useAuth()

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
            <p className="mt-2 text-sm text-gray-600">{t('loginPrompt')}</p>
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
            submitText={t('verifyCode')}
            loadingText={t('verifying')}
            otpLabel={t('otpLabel')}
            otpPlaceholder={t('otpPlaceholder')}
            resendText={t('resendCode')}
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
            isLogin={true}
          />
        )}
      </div>
      <Consent />
    </AuthLayout>
  )
}
