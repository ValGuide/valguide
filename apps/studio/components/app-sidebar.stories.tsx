import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider } from '@valguide/ui/components/sidebar'

const meta: Meta<typeof AppSidebar> = {
  title: 'Studio/Dashboard/Sidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {
  args: {},
}

export const Expanded: Story = {
  args: {},
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <Story />
      </SidebarProvider>
    ),
  ],
}

export const Collapsed: Story = {
  args: {},
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <Story />
      </SidebarProvider>
    ),
  ],
}

export const WithCustomVariant: Story = {
  args: {
    variant: 'floating',
  },
}

export const NonCollapsible: Story = {
  args: {
    collapsible: 'none',
  },
}
