import type { Meta, StoryObj } from '@storybook/react'
import { ThemeProvider } from '@valguide/core/features/app-theme/theme-provider'
import { SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import type { Team } from '@/features/orgs/components/team-switcher'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://github.com/shadcn.png',
}

const mockTeams: Team[] = [
  {
    id: 'team-1',
    nanoId: 'abc123def1',
    name: 'Acme Corp',
    role: 'owner',
    logo: 'https://github.com/shadcn.png',
  },
  {
    id: 'team-2',
    nanoId: 'abc123def2',
    name: 'Valerius Tech',
    role: 'admin',
  },
  {
    id: 'team-3',
    nanoId: 'abc123def3',
    name: 'Personal Projects',
    role: 'viewer',
  },
]

const meta: Meta<typeof AppSidebar> = {
  title: 'Studio/Shell/Sidebar',
  component: AppSidebar,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: {
      viewports: [1280],
    },
    docs: {
      description: {
        component:
          'The main dashboard sidebar with top-level navigation for Guides, Analytics, Team & Members, Settings, Team Switcher, My Profile, and Logout. Fully internationalized with support for multiple languages.',
      },
    },
  },
  args: {
    user: mockUser,
    teams: mockTeams,
    currentTeam: mockTeams[0],
    onLogout: () => console.log('Logout clicked'),
    onTeamSwitch: (teamId: string) => console.log('Team switched to:', teamId),
    onCreateTeam: async (name: string) => {
      console.log('Create team:', { name })
      return { success: true as const, team: { id: '123', name } }
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="light" setThemeFn={async ({ data }) => data}>
        <SidebarProvider defaultOpen={true}>
          <div style={{ minWidth: '768px', width: '100%', height: '100vh', display: 'flex' }}>
            <Story />
            <main className="flex-1 p-4">
              <SidebarTrigger className="mb-4" />
              <div className="text-muted-foreground text-sm">Click the button above to toggle the sidebar</div>
            </main>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {
  args: {
    pathname: '/en',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default sidebar with Guides (home) active. Top-level navigation items: Guides, Analytics, Team & Members, Settings, Team Switcher in header, and user menu with My Profile and Logout in footer.',
      },
    },
  },
}

export const AnalyticsActive: Story = {
  args: {
    pathname: '/en/analytics',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Analytics page active.',
      },
    },
  },
}

export const DesignActive: Story = {
  args: {
    pathname: '/en/design',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Design page active.',
      },
    },
  },
}

export const SettingsActive: Story = {
  args: {
    pathname: '/en/settings',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Workspace settings page active.',
      },
    },
  },
}

export const InvitesActive: Story = {
  args: {
    pathname: '/en/invites',
    pendingInvitationsCount: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with the Invites page active and two pending workspace invitations.',
      },
    },
  },
}

export const PendingInvitesBadge: Story = {
  args: {
    pathname: '/en',
    pendingInvitationsCount: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar footer showing the pending invitation count above the user card.',
      },
    },
  },
}

export const SupportActive: Story = {
  args: {
    pathname: '/en/support',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Support page active (secondary navigation).',
      },
    },
  },
}

export const FeedbackActive: Story = {
  args: {
    pathname: '/en/feedback',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Feedback page active (secondary navigation).',
      },
    },
  },
}

export const FloatingVariant: Story = {
  args: {
    pathname: '/en',
    variant: 'floating',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Sidebar with floating variant style.',
      },
    },
  },
}

export const InsetVariant: Story = {
  args: {
    pathname: '/en',
    variant: 'inset',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Sidebar with inset variant style.',
      },
    },
  },
}

export const NonCollapsible: Story = {
  args: {
    pathname: '/en',
    collapsible: 'none',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Sidebar that cannot be collapsed.',
      },
    },
  },
}

export const Loading: Story = {
  render: () => <AppSidebarSkeleton />,
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loader shown while sidebar data (user, teams) is loading.',
      },
    },
  },
}
