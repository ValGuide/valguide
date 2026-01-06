import type { Meta, StoryObj } from '@storybook/react'
import { SignOutButton } from './sign-out-button'

const meta = {
  title: 'Features/JoinTeam/SignOutButton',
  component: SignOutButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SignOutButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Sign Out',
    onSignOut: async () => console.log('Sign out clicked'),
  },
}
