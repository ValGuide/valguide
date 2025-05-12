import { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthLayout } from '../common/auth-layout'
import { OtpVerificationForm } from './otp-verification-form'
import { MessageAlert } from '../common/message-alert'
import { AuthSkeletonContainer } from '../common/auth-skeleton-container'

const OtpVerificationPageExample = () => {
  const t = useTranslations('login')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const email = 'user@example.com'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (otp.length === 6) {
        setMessage({ type: 'success', text: t('otpSent') })
      } else {
        setMessage({ type: 'error', text: t('otpError') })
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
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
        <p className="mt-2 text-sm text-gray-600">{`${t('verifyEmail')} ${email}`}</p>
      </div>

      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}

      <OtpVerificationForm
        otp={otp}
        onOtpChange={(e) => setOtp(e.target.value)}
        onSubmit={handleSubmit}
        onResendClick={handleResendOtp}
        loading={loading}
        isLogin={true}
      />
    </AuthLayout>
  )
}

const meta: Meta = {
  title: 'Auth/OtpVerificationPage',
  component: OtpVerificationPageExample,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const Loading: Story = {
  render: () => (
    <AuthLayout>
      <AuthSkeletonContainer showOtp={true} />
    </AuthLayout>
  ),
}
