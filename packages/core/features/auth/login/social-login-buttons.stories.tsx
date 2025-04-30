import { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from 'next-intl'
import { SocialLoginButtons } from './social-login-buttons'

const meta: Meta<typeof SocialLoginButtons> = {
  title: 'Auth/SocialLoginButtons',
  component: SocialLoginButtons,
  render: (args) => {
    const t = useTranslations('login')
    return <SocialLoginButtons {...args} dividerText={args.dividerText || t('orContinueWith')} />
  },
}

export default meta
type Story = StoryObj<typeof SocialLoginButtons>

export const Default: Story = {
  args: {
    onGoogleClick: () => {
      alert('Google login clicked')
    },
    onAppleClick: () => {
      alert('Apple login clicked')
    },
    loading: false,
  },
}

export const Loading: Story = {
  args: {
    onGoogleClick: () => {},
    onAppleClick: () => {},
    loading: true,
  },
}

export const CustomDividerText: Story = {
  args: {
    onGoogleClick: () => {
      alert('Google login clicked')
    },
    onAppleClick: () => {
      alert('Apple login clicked')
    },
    loading: false,
    dividerText: 'Alternative login methods',
  },
}
