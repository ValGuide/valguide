'use client'

import { useTranslations } from 'next-intl'
import { MessageAlert } from '../common/message-alert'
import { AuthLayout } from '../common/auth-layout'
import { useSignup } from './signup-provider'
import { OtpVerificationForm } from '../login/otp-verification-form'
import { SignupForm } from './signup-form'

export default function SignupContainer() {
  const t = useTranslations('signup')
  const {
    handleEmailSignup,
    handleVerifyOtp,
    otp,
    setOtp,
    handleResendOtp,
    loading,
    message,
    verifyingOtp,
    email,
    setEmail,
  } = useSignup()

  return (
    <AuthLayout>
      {verifyingOtp ? (
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
          <p className="mt-2 text-sm text-gray-600">{email ? `${t('verifyEmail')} ${email}` : t('checkEmail')}</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('signupPrompt')}</p>
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
        <SignupForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleEmailSignup}
          loading={loading}
          submitText={t('sendCode')}
          loadingText={t('sending')}
          emailLabel={t('emailLabel')}
          emailPlaceholder={t('emailPlaceholder')}
        />
      )}
    </AuthLayout>
  )
}
