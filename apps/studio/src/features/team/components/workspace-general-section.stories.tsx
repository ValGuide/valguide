import type { Meta, StoryObj } from '@storybook/react'
import type { TeamData } from '@valguide/core/features/orgs/types'
import { WorkspaceGeneralSection } from './workspace-general-section'

const mockData: TeamData = {
  team: {
    id: 'org-1',
    nanoId: 'orgNano123',
    name: 'ValGuide Seed Data',
    slug: 'valguide-seed-data',
    logoStoragePath: 'orgs/orgNano123/logos/logo.png',
    defaultThemeId: null,
    createdAt: new Date('2026-01-10T09:00:00Z'),
    updatedAt: new Date('2026-04-06T08:30:00Z'),
  },
  members: [],
  pendingInvites: [],
  currentUserRole: 'owner',
  currentUserId: 'user-1',
}

const meta = {
  title: 'Features/Team/WorkspaceGeneralSection',
  component: WorkspaceGeneralSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    data: mockData,
    onUpdateName: async () => {},
    onUploadAndSaveLogo: async () => {},
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkspaceGeneralSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutLogo: Story = {
  args: {
    data: {
      ...mockData,
      team: {
        ...mockData.team,
        logoStoragePath: null,
      },
    },
  },
}
