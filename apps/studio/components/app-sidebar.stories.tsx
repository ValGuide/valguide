import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider } from '@valguide/ui/components/sidebar'

const meta: Meta<typeof AppSidebar> = {
  title: 'Studio/Dashboard/Sidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main dashboard sidebar with top-level navigation for Guides, Analytics, Team & Members, Settings, Team Switcher, My Profile, and Logout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="flex h-screen">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default sidebar with top-level navigation items: Guides (home), Analytics, Team & Members, Settings, Team Switcher in header, and user menu with My Profile and Logout in footer.',
      },
    },
  },
}

export const Expanded: Story = {
  args: {},
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sidebar in expanded state showing all menu items and labels.',
      },
    },
  },
}

export const Collapsed: Story = {
  args: {},
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sidebar in collapsed icon-only mode. Hover over icons to see tooltips.',
      },
    },
  },
}

export const FloatingVariant: Story = {
  args: {
    variant: 'floating',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with floating variant style.',
      },
    },
  },
}

export const InsetVariant: Story = {
  args: {
    variant: 'inset',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with inset variant style.',
      },
    },
  },
}

export const NonCollapsible: Story = {
  args: {
    collapsible: 'none',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar that cannot be collapsed.',
      },
    },
  },
}
