import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthContainer } from '../common/auth-container'

const LoginPageExample = () => {
  const t = useTranslations('login')
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
        setMessage({ type: 'error', text: t('email.message') })
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

const meta: Meta = {
  title: 'Auth/LoginPage',
  component: LoginPageExample,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
