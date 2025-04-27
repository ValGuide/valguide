import { Meta, StoryObj } from '@storybook/react'
import { MessageAlert } from './message-alert'

const meta: Meta<typeof MessageAlert> = {
  title: 'Auth/MessageAlert',
  component: MessageAlert,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MessageAlert>

export const Success: Story = {
  args: {
    type: 'success',
    children: 'Your email has been verified successfully!',
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    children: 'Failed to send login code. Please try again.',
  },
}

export const Hidden: Story = {
  args: {
    type: 'success',
    children: 'This message is hidden',
    show: false,
  },
}
