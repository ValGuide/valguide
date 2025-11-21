import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NextIntlClientProvider } from 'next-intl'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { type Team } from '@valguide/core/features/orgs/components/team-switcher'

// Import messages for the story
import enMessages from '@valguide/i18n/messages/en.json'
import deMessages from '@valguide/i18n/messages/de.json'
import rmMessages from '@valguide/i18n/messages/rm.json'

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://github.com/shadcn.png',
}

const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    role: 'owner',
    logo: 'https://github.com/shadcn.png',
  },
  {
    id: 'team-2',
    name: 'Valerius Tech',
    slug: 'valerius-tech',
    role: 'admin',
  },
  {
    id: 'team-3',
    name: 'Personal Projects',
    slug: 'personal',
    role: 'viewer',
  },
]

const meta: Meta<typeof AppSidebar> = {
  title: 'Studio/Dashboard/Sidebar',
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
  },
  decorators: [
    (Story, { globals: { locale } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      return (
        <NextIntlClientProvider locale={locale || 'en'} messages={messages} timeZone="Europe/Zurich">
          <SidebarProvider defaultOpen={true}>
            <div style={{ minWidth: '768px', width: '100%', height: '100vh', display: 'flex' }}>
              <Story />
              <main className="flex-1 p-4">
                <SidebarTrigger className="mb-4" />
                <div className="text-muted-foreground text-sm">Click the button above to toggle the sidebar</div>
              </main>
            </div>
          </SidebarProvider>
        </NextIntlClientProvider>
      )
    },
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
    pathname: '/de/design',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Design page active (German locale).',
      },
    },
  },
}

export const TeamActive: Story = {
  args: {
    pathname: '/rm/team',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Team & Members page active (Romansh locale).',
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
        story: 'Sidebar with Settings page active.',
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
