import type { Meta, StoryObj } from '@storybook/react'
import type { TeamData } from '@valguide/core/features/orgs/types'
import { WorkspaceMembersSection } from './workspace-members-section'

const mockData: TeamData = {
  team: {
    id: 'org-1',
    nanoId: 'orgNano123',
    name: 'ValGuide Seed Data',
    slug: 'valguide-seed-data',
    logoStoragePath: null,
    defaultThemeId: null,
    createdAt: new Date('2026-01-10T09:00:00Z'),
    updatedAt: new Date('2026-04-06T08:30:00Z'),
  },
  members: [
    {
      id: 'member-1',
      userId: 'user-1',
      email: 'owner@museum.ch',
      firstName: 'Valerius',
      lastName: 'Hounder',
      role: 'owner',
      joinedAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'member-2',
      userId: 'user-2',
      email: 'curator@museum.ch',
      firstName: 'Anna',
      lastName: 'Mueller',
      role: 'curator',
      joinedAt: '2026-02-05T11:30:00Z',
    },
    {
      id: 'member-3',
      userId: 'user-3',
      email: 'editor@museum.ch',
      firstName: 'Lukas',
      lastName: 'Weber',
      role: 'editor',
      joinedAt: '2026-03-01T08:15:00Z',
    },
  ],
  pendingInvites: [
    {
      id: 'invite-1',
      email: 'colleague@museum.ch',
      role: 'editor',
      invitedBy: {
        name: 'Valerius Hounder',
        email: 'owner@museum.ch',
      },
      invitedAt: '2026-04-01T10:00:00Z',
      expiresAt: '2026-04-12T10:00:00Z',
    },
  ],
  currentUserRole: 'owner',
  currentUserId: 'user-1',
}

const meta = {
  title: 'Features/Team/WorkspaceMembersSection',
  component: WorkspaceMembersSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    data: mockData,
    onInvite: async () => {},
    onRemoveMember: async () => {},
    onChangeRole: async () => {},
    onResendInvite: async () => {},
    onCancelInvite: async () => {},
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkspaceMembersSection>

export default meta

type Story = StoryObj<typeof meta>

export const OwnerWithPendingInvites: Story = {}

export const CuratorReadOnly: Story = {
  args: {
    data: {
      ...mockData,
      currentUserRole: 'curator',
      currentUserId: 'user-2',
      pendingInvites: [],
    },
  },
}

export const EmptyWorkspace: Story = {
  args: {
    data: {
      ...mockData,
      members: [],
      pendingInvites: [],
    },
  },
}
