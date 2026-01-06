import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useTranslations } from '@valguide/core/i18n/mock'
import { MessageAlert } from './message-alert'

const meta: Meta<typeof MessageAlert> = {
  title: 'Auth/MessageAlert',
  component: MessageAlert,
  render: (args) => {
    const t = useTranslations('login')
    return (
      <MessageAlert {...args}>{args.children || (args.type === 'success' ? t('otpSent') : t('otpError'))}</MessageAlert>
    )
  },
}

export default meta
type Story = StoryObj<typeof MessageAlert>

export const Success: Story = {
  args: {
    type: 'success',
  },
}

export const ErrorMessage: Story = {
  args: {
    type: 'error',
  },
}

export const Hidden: Story = {
  args: {
    type: 'success',
    children: 'This message is hidden',
    show: false,
  },
}
