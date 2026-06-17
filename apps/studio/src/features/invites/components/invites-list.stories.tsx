import type { Meta, StoryObj } from '@storybook/react'
import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { expect, fn, userEvent, within } from 'storybook/test'
import { InvitesList } from './invites-list'

const invitations: CurrentUserInvitation[] = [
  {
    id: 'invite-museum',
    organizationId: 'organization-museum',
    organizationName: 'Acme Museum',
    organizationNanoId: 'acme-museum',
    email: 'jane@example.com',
    role: 'editor',
    invitedBy: {
      name: 'Alex Curator',
      email: 'alex@example.com',
    },
    invitedAt: '2026-06-16T10:00:00.000Z',
    expiresAt: '2026-06-23T10:00:00.000Z',
  },
  {
    id: 'invite-archive',
    organizationId: 'organization-archive',
    organizationName: 'Regional Archive with a Deliberately Long Workspace Name',
    organizationNanoId: 'regional-archive',
    email: 'jane@example.com',
    role: 'viewer',
    invitedBy: {
      name: '',
      email: 'admin@archive.example',
    },
    invitedAt: '2026-06-17T08:00:00.000Z',
    expiresAt: null,
  },
]

const meta = {
  title: 'Studio/Invites/InvitesList',
  component: InvitesList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[min(44rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  args: {
    invitations,
    onAccept: fn(),
    onDecline: fn(),
  },
} satisfies Meta<typeof InvitesList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    invitations: [],
  },
}

export const Busy: Story = {
  args: {
    busyInvitationId: invitations[0]!.id,
  },
}

export const Actions: Story = {
  args: {
    invitations: [invitations[0]!],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Decline' }))
    await expect(args.onDecline).toHaveBeenCalledWith(invitations[0])

    await userEvent.click(canvas.getByRole('button', { name: 'Accept' }))
    await expect(args.onAccept).toHaveBeenCalledWith(invitations[0])
  },
}
