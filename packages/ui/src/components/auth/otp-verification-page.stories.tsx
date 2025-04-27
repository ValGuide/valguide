import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AuthLayout } from './auth-layout'
import { OtpVerificationForm } from './otp-verification-form'
import { MessageAlert } from './message-alert'

const OtpVerificationPageExample = () => {
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
        setMessage({ type: 'success', text: 'OTP verified successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' })
      }
    }, 1000)
  }

  const handleResendOtp = () => {
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setMessage({ type: 'success', text: 'A new code has been sent to your email' })
    }, 1000)
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Welcome</h2>
        <p className="mt-2 text-sm text-gray-600">{`Verify your email: ${email}`}</p>
      </div>

      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}

      <OtpVerificationForm
        otp={otp}
        onOtpChange={(e) => setOtp(e.target.value)}
        onSubmit={handleSubmit}
        onResendClick={handleResendOtp}
        loading={loading}
        submitText="Verify code"
        loadingText="Verifying..."
        otpLabel="Verification code"
        otpPlaceholder="Enter the 6-digit code"
        resendText="Didn't receive a code? Send again"
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
