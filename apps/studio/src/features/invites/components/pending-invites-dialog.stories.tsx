import type { Meta, StoryObj } from '@storybook/react'
import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { expect, fn, userEvent, within } from 'storybook/test'
import { PendingInvitesDialog } from './pending-invites-dialog'

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
    organizationName: 'Regional Archive',
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
  title: 'Studio/Invites/PendingInvitesDialog',
  component: PendingInvitesDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    open: true,
    invitations: [invitations[0]!],
    onOpenChange: fn(),
    onAccept: fn(),
    onDecline: fn(),
    onViewAll: fn(),
  },
} satisfies Meta<typeof PendingInvitesDialog>

export default meta
type Story = StoryObj<typeof meta>

export const SingleInvitation: Story = {}

export const MultipleInvitations: Story = {
  args: {
    invitations,
  },
}

export const Busy: Story = {
  args: {
    invitations,
    busyInvitationId: invitations[0]!.id,
  },
}

export const Actions: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    await userEvent.click(body.getByRole('button', { name: 'Decline' }))
    await expect(args.onDecline).toHaveBeenCalledWith(invitations[0])

    await userEvent.click(body.getByRole('button', { name: 'Accept' }))
    await expect(args.onAccept).toHaveBeenCalledWith(invitations[0])

    await userEvent.click(body.getByRole('button', { name: 'View all invites' }))
    await expect(args.onViewAll).toHaveBeenCalled()
  },
}

export const LongContent: Story = {
  args: {
    invitations: [
      {
        ...invitations[0]!,
        organizationName: 'International Association for the Preservation of Regional Cultural Collections',
        invitedBy: {
          name: 'Alexandra von Example-Surname, Senior Collections Administrator',
          email: 'alexandra@example.com',
        },
      },
    ],
  },
}
