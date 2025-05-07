import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthLayout } from '../common/auth-layout'
import { AuthForm } from '../auth-form'
import { OtpVerificationForm } from '../login/otp-verification-form'
import { MessageAlert } from '../common/message-alert'

const SignupPageExample = () => {
  const t = useTranslations('signup')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleEmailSignup = (email: string) => {
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
        <AuthForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleEmailSignup}
          loading={loading}
          submitText={t('sendCode')}
          loadingText={t('sending')}
          emailLabel={t('emailLabel')}
          emailPlaceholder={t('emailPlaceholder')}
          isLogin={false}
        />
      )}
    </AuthLayout>
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
