'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '../auth-provider'
import { AuthContainer } from '../common/auth-container'

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
    <AuthContainer
      // Translation strings
      welcomeText={t('welcome')}
      promptText={t('loginPrompt')}
      verifyEmailText={t('verifyEmail')}
      checkEmailText={t('checkEmail')}
      sendCodeText={t('sendCode')}
      sendingText={t('sending')}
      verifyCodeText={t('verifyCode')}
      verifyingText={t('verifying')}
      otpLabelText={t('otpLabel')}
      otpPlaceholderText={t('otpPlaceholder')}
      resendCodeText={t('resendCode')}
      emailLabelText={t('emailLabel')}
      emailPlaceholderText={t('emailPlaceholder')}
      // Auth state and handlers
      email={email}
      setEmail={setEmail}
      otp={otp}
      setOtp={setOtp}
      handleEmailAuth={handleEmailAuth}
      handleVerifyOtp={handleVerifyOtp}
      handleResendOtp={handleResendOtp}
      loading={loading}
      message={message}
      verifyingOtp={verifyingOtp}
      isLogin={true}
    />
  )
}
