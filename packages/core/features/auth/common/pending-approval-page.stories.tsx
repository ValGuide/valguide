import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { PendingApprovalPage } from './pending-approval-page'

const meta: Meta<typeof PendingApprovalPage> = {
  title: 'Auth/PendingApprovalPage',
  component: PendingApprovalPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onSignOut: fn(),
    onCheckAgain: fn(),
    supportEmail: 'team@valguide.com',
    userEmail: 'curator@museum.ch',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checking: Story = {
  args: {
    isChecking: true,
  },
}
