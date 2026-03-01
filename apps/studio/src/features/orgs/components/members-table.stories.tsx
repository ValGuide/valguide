import type { Meta, StoryObj } from '@storybook/react'
import { MembersTable } from './members-table'

const meta: Meta<typeof MembersTable> = {
  title: 'Core/Orgs/MembersTable',
  component: MembersTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Table displaying team members with their roles, join dates, and management actions. Supports role changes and member removal based on current user permissions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof MembersTable>

const mockMembers = [
  {
    id: '1',
    userId: 'user-1',
    email: 'anna.mueller@museum.ch',
    firstName: 'Anna',
    lastName: 'Mueller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    role: 'owner' as const,
    joinedAt: '2023-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user-2',
    email: 'hans.meier@museum.ch',
    firstName: 'Hans',
    lastName: 'Meier',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hans',
    role: 'admin' as const,
    joinedAt: '2023-02-20T14:30:00Z',
  },
  {
    id: '3',
    userId: 'user-3',
    email: 'sophie.schmidt@museum.ch',
    firstName: 'Sophie',
    lastName: 'Schmidt',
    role: 'curator' as const,
    joinedAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    userId: 'user-4',
    email: 'lukas.weber@museum.ch',
    firstName: 'Lukas',
    lastName: 'Weber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lukas',
    role: 'editor' as const,
    joinedAt: '2023-04-05T11:45:00Z',
  },
  {
    id: '5',
    userId: 'user-5',
    email: 'maria.fischer@museum.ch',
    firstName: 'Maria',
    lastName: 'Fischer',
    role: 'viewer' as const,
    joinedAt: '2023-05-12T16:20:00Z',
  },
]

export const AsOwner: Story = {
  args: {
    members: mockMembers,
    currentUserRole: 'owner',
    currentUserId: 'user-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members table viewed by team Owner. Can manage all members except themselves.',
      },
    },
  },
}

export const AsAdmin: Story = {
  args: {
    members: mockMembers,
    currentUserRole: 'admin',
    currentUserId: 'user-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members table viewed by Admin. Can manage Curators, Editors, and Viewers, but not Owners.',
      },
    },
  },
}

export const AsCurator: Story = {
  args: {
    members: mockMembers,
    currentUserRole: 'curator',
    currentUserId: 'user-3',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members table viewed by Curator. Cannot manage any members (no action buttons shown).',
      },
    },
  },
}

export const AsEditor: Story = {
  args: {
    members: mockMembers,
    currentUserRole: 'editor',
    currentUserId: 'user-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members table viewed by Editor. Cannot manage any members.',
      },
    },
  },
}

export const AsViewer: Story = {
  args: {
    members: mockMembers,
    currentUserRole: 'viewer',
    currentUserId: 'user-5',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members table viewed by Viewer. Read-only access.',
      },
    },
  },
}

export const SmallTeam: Story = {
  args: {
    members: [mockMembers[0]!, mockMembers[1]!],
    currentUserRole: 'owner',
    currentUserId: 'user-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small team with only 2 members.',
      },
    },
  },
}

export const LargeTeam: Story = {
  args: {
    members: [
      ...mockMembers,
      {
        id: '6',
        userId: 'user-6',
        email: 'peter.zimmermann@museum.ch',
        firstName: 'Peter',
        lastName: 'Zimmermann',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter',
        role: 'editor' as const,
        joinedAt: '2023-06-18T10:30:00Z',
      },
      {
        id: '7',
        userId: 'user-7',
        email: 'claudia.keller@museum.ch',
        firstName: 'Claudia',
        lastName: 'Keller',
        role: 'curator' as const,
        joinedAt: '2023-07-22T13:15:00Z',
      },
      {
        id: '8',
        userId: 'user-8',
        email: 'thomas.huber@museum.ch',
        firstName: 'Thomas',
        lastName: 'Huber',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
        role: 'editor' as const,
        joinedAt: '2023-08-09T09:00:00Z',
      },
      {
        id: '9',
        userId: 'user-9',
        email: 'sabine.brunner@museum.ch',
        firstName: 'Sabine',
        lastName: 'Brunner',
        role: 'viewer' as const,
        joinedAt: '2023-09-14T14:45:00Z',
      },
      {
        id: '10',
        userId: 'user-10',
        email: 'marco.steiner@museum.ch',
        firstName: 'Marco',
        lastName: 'Steiner',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
        role: 'admin' as const,
        joinedAt: '2023-10-03T11:20:00Z',
      },
    ],
    currentUserRole: 'owner',
    currentUserId: 'user-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Larger team with 10 members showing various roles.',
      },
    },
  },
}

export const EmptyTeam: Story = {
  args: {
    members: [],
    currentUserRole: 'owner',
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when team has no members.',
      },
    },
  },
}

export const MembersWithoutAvatars: Story = {
  args: {
    members: mockMembers.map((m) => ({ ...m, avatar: undefined })),
    currentUserRole: 'owner',
    currentUserId: 'user-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members without profile pictures (shows initials fallback).',
      },
    },
  },
}

export const MembersWithPartialNames: Story = {
  args: {
    members: [
      { ...mockMembers[0]! },
      { ...mockMembers[1]!, lastName: null },
      { ...mockMembers[2]!, firstName: null },
      { ...mockMembers[3]!, firstName: null, lastName: null },
    ],
    currentUserRole: 'owner',
    currentUserId: 'user-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Members with partial or missing names (falls back to email).',
      },
    },
  },
}

export const WithoutActionsCallbacks: Story = {
  args: {
    members: mockMembers,
    currentUserRole: 'owner',
    currentUserId: 'user-1',
    onChangeRole: undefined,
    onRemoveMember: undefined,
    onResendInvite: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Members table without action callbacks (read-only mode).',
      },
    },
  },
}
