import type { Meta, StoryObj } from '@storybook/react'
import { JoinTeamCard } from './join-team-card'

const meta = {
  title: 'Features/JoinTeam/JoinTeamCard',
  component: JoinTeamCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
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
