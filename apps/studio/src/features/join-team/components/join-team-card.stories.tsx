import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { JoinTeamCard } from './join-team-card'

const meta = {
  title: 'Studio/Join Team/JoinTeamCard',
  component: JoinTeamCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JoinTeamCard>

export default meta
type Story = StoryObj<typeof meta>

const mockInvite = {
  organization: { name: 'Acme Museum' },
  email: 'jane@example.com',
}

export const Invalid: Story = {
  args: {
    variant: 'invalid',
  },
}

export const Accepted: Story = {
  args: {
    variant: 'accepted',
    invite: mockInvite,
  },
}

export const Public: Story = {
  args: {
    variant: 'public',
    invite: mockInvite,
    loginNext: '/join-team?invitationId=invitation-123',
  },
}

export const WrongAccount: Story = {
  args: {
    variant: 'wrong-account',
    invite: mockInvite,
    userEmail: 'wrong@example.com',
    onSignOut: fn(),
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
