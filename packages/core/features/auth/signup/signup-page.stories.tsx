import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthContainer } from '../common/auth-container'

const SignupPageExample = () => {
  const t = useTranslations('signup')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleEmailAuth = (email: string) => {
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (email.includes('@')) {
        setVerifyingOtp(true)
        setMessage({ type: 'success', text: t('otpSent') })
      } else {
        setMessage({ type: 'error', text: t('invalidEmail') })
      }
    }, 1000)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (otp.length === 6) {
        setMessage({ type: 'success', text: 'Successfully verified! Redirecting...' })
      } else {
        setMessage({ type: 'error', text: 'Invalid verification code' })
      }
    }, 1000)
  }

  const handleResendOtp = () => {
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setMessage({ type: 'success', text: t('otpSent') })
    }, 1000)
  }

  return (
    <AuthContainer
      // Translation strings
      welcomeText={t('welcome')}
      promptText={t('signupPrompt')}
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
      isLogin={false}
    />
  )
}

const meta: Meta = {
  title: 'Auth/SignupPage',
  component: SignupPageExample,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
