'use client'

import { useTranslations } from 'next-intl'
import { MessageAlert } from '../common/message-alert'
import { AuthLayout } from '../common/auth-layout'
import { useLogin } from './login-provider'
import { SocialLoginButtons } from './social-login-buttons'
import { OtpVerificationForm } from './otp-verification-form'
import { LoginForm } from './login-form'

export default function LoginContainer() {
  const t = useTranslations('login')
  const {
    handleOAuthLogin,
    handleEmailLogin,
    handleVerifyOtp,
    otp,
    setOtp,
    handleResendOtp,
    loading,
    message,
    verifyingOtp,
    email,
    setEmail,
  } = useLogin()

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
        <LoginForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleEmailLogin}
          loading={loading}
          submitText={t('sendCode')}
          loadingText={t('sending')}
          emailLabel={t('emailLabel')}
          emailPlaceholder={t('emailPlaceholder')}
        />
      )}
      {!verifyingOtp && (
        <SocialLoginButtons
          onGoogleClick={() => handleOAuthLogin('google')}
          onAppleClick={() => handleOAuthLogin('apple')}
          loading={loading}
          dividerText={t('orContinueWith')}
        />
      )}
    </AuthLayout>
  )
}
