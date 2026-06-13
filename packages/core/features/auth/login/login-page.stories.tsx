import type { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from '@valguide/core/i18n/client'
import { useState } from 'react'
import { AuthContainer } from '../common/auth-container'
import LoginLoading from './loading'

const AuthPageExample = () => {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleEmailAuth = (email: string) => {
    setLoading(true)
    setMessage(null)

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

    setTimeout(() => {
      setLoading(false)
      if (otp.length === 6) {
        setMessage({ type: 'success', text: t('verificationSuccess') })
      } else {
        setMessage({ type: 'error', text: t('verificationError') })
      }
    }, 1000)
  }

  const handleResendOtp = () => {
    setLoading(true)
    setMessage(null)

    setTimeout(() => {
      setLoading(false)
      setMessage({ type: 'success', text: t('otpSent') })
    }, 1000)
  }

  const handleChangeEmail = () => {
    setVerifyingOtp(false)
    setOtp('')
    setMessage(null)
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
      handleChangeEmail={handleChangeEmail}
      loading={loading}
      message={message}
      verifyingOtp={verifyingOtp}
    />
  )
}

const meta: Meta = {
  title: 'Auth/LoginPage',
  component: AuthPageExample,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const Loading: Story = {
  render: () => <LoginLoading />,
}
