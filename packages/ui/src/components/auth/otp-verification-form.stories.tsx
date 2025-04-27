import { Meta, StoryObj } from '@storybook/react'
import { OtpVerificationForm } from './otp-verification-form'

const meta: Meta<typeof OtpVerificationForm> = {
  title: 'Auth/OtpVerificationForm',
  component: OtpVerificationForm,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof OtpVerificationForm>

export const Default: Story = {
  args: {
    otp: '',
    onOtpChange: () => {},
    onSubmit: (e) => {
      e.preventDefault()
      alert('OTP submitted')
    },
    onResendClick: () => {
      alert('Resend OTP clicked')
    },
    loading: false,
    submitText: 'Verify code',
    loadingText: 'Verifying...',
    otpLabel: 'Verification code',
    otpPlaceholder: 'Enter the 6-digit code',
    resendText: "Didn't receive a code? Send again",
  },
}

export const WithOtp: Story = {
  args: {
    otp: '123456',
    onOtpChange: () => {},
    onSubmit: (e) => {
      e.preventDefault()
      alert('OTP submitted')
    },
    onResendClick: () => {
      alert('Resend OTP clicked')
    },
    loading: false,
    submitText: 'Verify code',
    loadingText: 'Verifying...',
    otpLabel: 'Verification code',
    otpPlaceholder: 'Enter the 6-digit code',
    resendText: "Didn't receive a code? Send again",
  },
}

export const Loading: Story = {
  args: {
    otp: '123456',
    onOtpChange: () => {},
    onSubmit: (e) => {
      e.preventDefault()
    },
    onResendClick: () => {},
    loading: true,
    submitText: 'Verify code',
    loadingText: 'Verifying...',
    otpLabel: 'Verification code',
    otpPlaceholder: 'Enter the 6-digit code',
    resendText: "Didn't receive a code? Send again",
  },
}
