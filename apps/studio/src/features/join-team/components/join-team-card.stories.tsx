import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { JoinTeamCard } from './join-team-card'

const meta = {
  title: 'Features/JoinTeam/JoinTeamCard',
  component: JoinTeamCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof JoinTeamCard>

export default meta
type Story = StoryObj<typeof meta>

const mockInvite = {
  organization: { name: 'Acme Museum' },
  email: 'jane@example.com',
}

const mockSignOut = async () => {
  console.log('Sign out clicked')
}

export const Invalid: Story = {
  args: {
    variant: 'invalid',
  },
}

export const Public: Story = {
  args: {
    variant: 'public',
    invite: mockInvite,
    nextUrl: '/join-team',
  },
}

export const WrongAccount: Story = {
  args: {
    variant: 'wrong-account',
    invite: mockInvite,
    userEmail: 'wrong@example.com',
    onSignOut: mockSignOut,
  },
}

export const Joining: Story = {
  args: {
    variant: 'joining',
    invite: mockInvite,
  },
}

export const JoiningError: Story = {
  args: {
    variant: 'joining',
    invite: mockInvite,
    error: 'Failed to join team',
  },
}
