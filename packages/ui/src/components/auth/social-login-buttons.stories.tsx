import { Meta, StoryObj } from '@storybook/react'
import { SocialLoginButtons } from './social-login-buttons'

const meta: Meta<typeof SocialLoginButtons> = {
  title: 'Auth/SocialLoginButtons',
  component: SocialLoginButtons,
  tags: ['autodocs'],
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
    dividerText: 'Or continue with',
  },
}

export const Loading: Story = {
  args: {
    onGoogleClick: () => {},
    onAppleClick: () => {},
    loading: true,
    dividerText: 'Or continue with',
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
