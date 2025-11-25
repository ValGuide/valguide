import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { TeamSwitcher } from './team-switcher'
import { SidebarProvider } from '@valguide/ui/components/sidebar'

// Import messages for the story
import enMessages from '@valguide/i18n/messages/en.json'
import deMessages from '@valguide/i18n/messages/de.json'
import rmMessages from '@valguide/i18n/messages/rm.json'

const meta: Meta<typeof TeamSwitcher> = {
  title: 'Core/Orgs/TeamSwitcher',
  component: TeamSwitcher,
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
    (Story, { globals: { locale } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      const currentLocale = locale || 'en'

      return (
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <SidebarProvider>
            <div style={{ width: '280px' }}>
              <Story />
            </div>
          </SidebarProvider>
        </NextIntlClientProvider>
      )
    },
  ],
  args: {
    // Action handlers are auto-wired via the Actions addon
  },
}

export default meta

type Story = StoryObj<typeof TeamSwitcher>

const mockTeams = [
  {
    id: '1',
    name: 'National Museum Zurich',
    slug: 'national-museum-zurich',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum1',
    role: 'owner' as const,
  },
  {
    id: '2',
    name: 'Art Museum Basel',
    slug: 'art-museum-basel',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum2',
    role: 'admin' as const,
  },
  {
    id: '3',
    name: 'Bern Historical Museum',
    slug: 'bern-historical-museum',
    role: 'curator' as const,
  },
  {
    id: '4',
    name: 'Lucerne Transport Museum',
    slug: 'lucerne-transport-museum',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum4',
    role: 'editor' as const,
  },
  {
    id: '5',
    name: 'Geneva Natural History',
    slug: 'geneva-natural-history',
    role: 'viewer' as const,
  },
]

export const Default: Story = {
  args: {
    teams: mockTeams,
    activeTeamSlug: 'national-museum-zurich',
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
    activeTeamSlug: 'art-museum-basel',
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
    activeTeamSlug: 'bern-historical-museum',
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
    activeTeamSlug: 'lucerne-transport-museum',
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
    activeTeamSlug: 'geneva-natural-history',
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
    teams: [mockTeams[0]],
    activeTeamSlug: 'national-museum-zurich',
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
        name: 'Swiss National Library',
        slug: 'swiss-national-library',
        role: 'admin' as const,
      },
      {
        id: '7',
        name: 'Museum Rietberg',
        slug: 'museum-rietberg',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum7',
        role: 'curator' as const,
      },
      {
        id: '8',
        name: 'Olympic Museum Lausanne',
        slug: 'olympic-museum',
        role: 'editor' as const,
      },
      {
        id: '9',
        name: 'Forum of Swiss History',
        slug: 'forum-swiss-history',
        role: 'viewer' as const,
      },
      {
        id: '10',
        name: 'Museum of Communication',
        slug: 'museum-communication',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=museum10',
        role: 'admin' as const,
      },
    ],
    activeTeamSlug: 'national-museum-zurich',
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
    activeTeamSlug: 'geneva-natural-history',
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
    activeTeamSlug: 'geneva-natural-history',
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
    activeTeamSlug: 'national-museum-zurich',
  },
  parameters: {
    docs: {
      description: {
        story: 'Team switcher with teams that have no logos (shows initials fallback).',
      },
    },
  },
}
