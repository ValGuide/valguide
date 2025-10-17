import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { OtpVerificationForm } from '../otp/otp-verification-form'

const OtpVerificationExample = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (otp.length === 6) {
        setVerified(true)
      } else {
        alert('Please enter a 6-digit code')
      }
    }, 1000)
  }

  const handleResend = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert('Verification code resent')
    }, 1000)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {verified ? (
        <div className="text-center p-4 bg-green-100 rounded mb-4">
          <p className="text-green-800">Successfully verified!</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              setVerified(false)
              setOtp('')
            }}
          >
            Reset Form
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Verify Your Email</h2>
            <p className="text-gray-600">Enter the verification code sent to your email</p>
          </div>

          <OtpVerificationForm
            otp={otp}
            onOtpChange={(e) => setOtp(e.target.value)}
            onSubmit={handleSubmit}
            onResendClick={handleResend}
            loading={loading}
            isLogin={false}
            title="Verify Your Email"
          />
        </>
      )}
    </div>
  )
}

const meta = {
  title: 'Auth/OtpVerification',
  component: OtpVerificationExample,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof OtpVerificationExample>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPrefilledOtp: Story = {
  render: () => {
    const [otp, setOtp] = useState('123456')
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        alert('Verification successful')
      }, 1000)
    }

    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-gray-600">Enter the verification code sent to your email</p>
        </div>

        <OtpVerificationForm
          otp={otp}
          onOtpChange={(e) => setOtp(e.target.value)}
          onSubmit={handleSubmit}
          onResendClick={() => alert('Code resent')}
          loading={loading}
          isLogin={false}
          title="Verify Your Email"
        />
      </div>
    )
  },
}

export const Loading: Story = {
  render: () => {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-gray-600">Enter the verification code sent to your email</p>
        </div>

        <OtpVerificationForm
          otp="123456"
          onOtpChange={() => {}}
          onSubmit={(e) => e.preventDefault()}
          onResendClick={() => {}}
          loading={true}
          isLogin={false}
          title="Verify Your Email"
        />
      </div>
    )
  },
}
