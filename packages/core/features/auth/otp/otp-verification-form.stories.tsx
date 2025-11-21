import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from '@storybook/test'
import { OtpVerificationForm } from './otp-verification-form'

const meta: Meta<typeof OtpVerificationForm> = {
  title: 'Auth/OtpVerificationForm',
  component: OtpVerificationForm,
}

export default meta
type Story = StoryObj<typeof OtpVerificationForm>

export const Default: Story = {
  args: {
    otp: '',
    onOtpChange: fn(),
    onSubmit: (e) => {
      e.preventDefault()
      alert('OTP submitted')
    },
    onResendClick: () => {
      alert('Resend OTP clicked')
    },
    loading: false,
    isLogin: true,
  },
}

export const WithOtp: Story = {
  args: {
    otp: '123456',
    onOtpChange: fn(),
    onSubmit: (e) => {
      e.preventDefault()
      alert('OTP submitted')
    },
    onResendClick: () => {
      alert('Resend OTP clicked')
    },
    loading: false,
    isLogin: true,
  },
}

export const Loading: Story = {
  args: {
    otp: '123456',
    onOtpChange: fn(),
    onSubmit: (e) => {
      e.preventDefault()
    },
    onResendClick: fn(),
    loading: true,
    isLogin: true,
  },
}

export const Signup: Story = {
  args: {
    otp: '',
    onOtpChange: fn(),
    onSubmit: (e) => {
      e.preventDefault()
      alert('OTP submitted')
    },
    onResendClick: () => {
      alert('Resend OTP clicked')
    },
    loading: false,
    isLogin: false,
  },
}
