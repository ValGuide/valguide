import type { Meta, StoryObj } from '@storybook/react'
import { SidebarProvider } from '@valguide/ui/components/sidebar'
import { TeamSwitcher } from './team-switcher'

const meta: Meta<typeof TeamSwitcher> = {
  title: 'Core/Orgs/TeamSwitcher',
  component: TeamSwitcher,
  args: {
    onCreateTeam: () => console.log('Create team clicked'),
    onTeamSettings: (teamId) => console.log('Team settings clicked', teamId),
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Team switcher dropdown for navigating between teams. Shows team logo/avatar, name, and user role. Supports creating new teams and accessing team settings.',
      },
    },
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div style={{ width: '280px' }}>
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof TeamSwitcher>

const mockTeams = [
  {
    id: '1',
    nanoId: 'abc123def1',
    name: 'National Museum Zurich',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum1',
    role: 'owner' as const,
  },
  {
    id: '2',
    nanoId: 'abc123def2',
    name: 'Art Museum Basel',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum2',
    role: 'admin' as const,
  },
  {
    id: '3',
    nanoId: 'abc123def3',
    name: 'Bern Historical Museum',
    role: 'curator' as const,
  },
  {
    id: '4',
    nanoId: 'abc123def4',
    name: 'Lucerne Transport Museum',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum4',
    role: 'editor' as const,
  },
  {
    id: '5',
    nanoId: 'abc123def5',
    name: 'Geneva Natural History',
    role: 'viewer' as const,
  },
]

export const Default: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'national-museum-zurich',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default team switcher with user as Owner of the active team.',
      },
    },
  },
}

export const AdminRole: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'art-museum-basel',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with user as Admin of the active team.',
      },
    },
  },
}

export const CuratorRole: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'bern-historical-museum',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with user as Curator (can publish content but not manage members).',
      },
    },
  },
}

export const EditorRole: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'lucerne-transport-museum',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with user as Editor (can create/edit drafts but not publish).',
      },
    },
  },
}

export const ViewerRole: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'geneva-natural-history',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with user as Viewer (read-only access).',
      },
    },
  },
}

export const SingleTeam: Story = {
  args: {
    teams: [mockTeams[0]!],
    activeTeamId: 'national-museum-zurich',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher when user belongs to only one team.',
      },
    },
  },
}

export const ManyTeams: Story = {
  args: {
    teams: [
      ...mockTeams,
      {
        id: '6',
        nanoId: 'abc123def6',
        name: 'Swiss National Library',
        role: 'admin' as const,
      },
      {
        id: '7',
        nanoId: 'abc123def7',
        name: 'Museum Rietberg',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum7',
        role: 'curator' as const,
      },
      {
        id: '8',
        nanoId: 'abc123def8',
        name: 'Olympic Museum Lausanne',
        role: 'editor' as const,
      },
      {
        id: '9',
        nanoId: 'abc123def9',
        name: 'Forum of Swiss History',
        role: 'viewer' as const,
      },
      {
        id: '10',
        nanoId: 'abc123de10',
        name: 'Museum of Communication',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum10',
        role: 'admin' as const,
      },
    ],
    activeTeamId: 'national-museum-zurich',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with many teams.',
      },
    },
  },
}

export const WithoutCreateAction: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'geneva-natural-history',
    onCreateTeam: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher without create team action (e.g., for viewers who cannot create teams).',
      },
    },
  },
}

export const WithoutSettingsAction: Story = {
  args: {
    teams: mockTeams,
    activeTeamId: 'geneva-natural-history',
    onTeamSettings: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher without settings action.',
      },
    },
  },
}

export const NoLogos: Story = {
  args: {
    teams: mockTeams.map((team) => ({ ...team, logo: undefined })),
    activeTeamId: 'national-museum-zurich',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with teams that have no logos (shows initials fallback).',
      },
    },
  },
}
