import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { AccountStatusPage } from './account-status-page'

const meta: Meta<typeof AccountStatusPage> = {
  title: 'Auth/AccountStatusPage',
  component: AccountStatusPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    variant: 'pending',
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

export const Blocked: Story = {
  args: {
    variant: 'blocked',
  },
}

export const Deactivated: Story = {
  args: {
    variant: 'deactivated',
  },
}
