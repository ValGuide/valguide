import type { Meta, StoryObj } from '@storybook/react'
import { PendingInvitesList } from './pending-invites-list'

const meta: Meta<typeof PendingInvitesList> = {
  title: 'Core/Orgs/PendingInvitesList',
  component: PendingInvitesList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'List of pending team invitations with status, expiry tracking, and management actions (resend/cancel).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof PendingInvitesList>

const now = new Date()
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
const in6Days = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

const mockInvitations = [
  {
    id: '1',
    email: 'john.doe@newmuseum.ch',
    role: 'editor' as const,
    invitedBy: {
      name: 'Anna Mueller',
      email: 'anna.mueller@museum.ch',
    },
    invitedAt: oneWeekAgo.toISOString(),
    expiresAt: tomorrow.toISOString(),
  },
  {
    id: '2',
    email: 'sarah.johnson@newmuseum.ch',
    role: 'curator' as const,
    invitedBy: {
      name: 'Hans Meier',
      email: 'hans.meier@museum.ch',
    },
    invitedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in3Days.toISOString(),
  },
  {
    id: '3',
    email: 'mike.wilson@consultant.com',
    role: 'viewer' as const,
    invitedBy: {
      name: 'Anna Mueller',
      email: 'anna.mueller@museum.ch',
    },
    invitedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in6Days.toISOString(),
  },
]

export const Default: Story = {
  args: {
    invitations: mockInvitations,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default pending invitations list with various expiry times.',
      },
    },
  },
}

export const SingleInvitation: Story = {
  args: {
    invitations: [mockInvitations[0]!],
  },
  parameters: {
    docs: {
      description: {
        story: 'Single pending invitation.',
      },
    },
  },
}

export const WithExpiredInvitations: Story = {
  args: {
    invitations: [
      ...mockInvitations,
      {
        id: '4',
        email: 'expired@example.com',
        role: 'editor' as const,
        invitedBy: {
          name: 'Hans Meier',
          email: 'hans.meier@museum.ch',
        },
        invitedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: yesterday.toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Pending invitations list including an expired invitation (shown in red).',
      },
    },
  },
}

export const ManyInvitations: Story = {
  args: {
    invitations: [
      ...mockInvitations,
      {
        id: '4',
        email: 'alice.brown@newmuseum.ch',
        role: 'admin' as const,
        invitedBy: {
          name: 'Anna Mueller',
          email: 'anna.mueller@museum.ch',
        },
        invitedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: in6Days.toISOString(),
      },
      {
        id: '5',
        email: 'bob.martin@partner.org',
        role: 'viewer' as const,
        invitedBy: {
          name: 'Sophie Schmidt',
          email: 'sophie.schmidt@museum.ch',
        },
        invitedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '6',
        email: 'carol.white@university.edu',
        role: 'editor' as const,
        invitedBy: {
          name: 'Anna Mueller',
          email: 'anna.mueller@museum.ch',
        },
        invitedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Many pending invitations from different team members.',
      },
    },
  },
}

export const ExpiringToday: Story = {
  args: {
    invitations: [
      {
        id: '1',
        email: 'urgent@example.com',
        role: 'curator' as const,
        invitedBy: {
          name: 'Anna Mueller',
          email: 'anna.mueller@museum.ch',
        },
        invitedAt: oneWeekAgo.toISOString(),
        expiresAt: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Invitation expiring today.',
      },
    },
  },
}

export const Empty: Story = {
  args: {
    invitations: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state - component returns null when no pending invitations.',
      },
    },
  },
}

export const WithoutActions: Story = {
  args: {
    invitations: mockInvitations,
    onResendInvite: undefined,
    onCancelInvite: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pending invitations without action callbacks (read-only).',
      },
    },
  },
}
