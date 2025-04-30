import { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from 'next-intl'
import { OtpVerificationForm } from './otp-verification-form'

const meta: Meta<typeof OtpVerificationForm> = {
  title: 'Auth/OtpVerificationForm',
  component: OtpVerificationForm,
  render: (args) => {
    const t = useTranslations('login')
    return (
      <OtpVerificationForm
        {...args}
        submitText={t('verifyCode')}
        loadingText={t('verifying')}
        otpLabel={t('otpLabel')}
        otpPlaceholder={t('otpPlaceholder')}
        resendText={t('resendCode')}
      />
    )
  },
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
  },
}
