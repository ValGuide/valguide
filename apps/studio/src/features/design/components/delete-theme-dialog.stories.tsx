import type { Meta, StoryObj } from '@storybook/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import type { ThemeUsageDetails } from '@valguide/core/features/themes/get-theme-usage.fn'
import { fn } from 'storybook/test'
import { DeleteThemeDialog } from './delete-theme-dialog'

const unusedThemeUsage: ThemeUsageDetails = {
  tours: [],
  isWorkspaceDefault: false,
}

const meta = {
  title: 'Design/Dialogs/DeleteThemeDialog',
  component: DeleteThemeDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    themeId: 'theme-1',
    themeName: 'Modern Museum',
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
    isLoading: false,
    onGetUsage: fn(async () => unusedThemeUsage),
  },
  decorators: [
    (Story) => {
      const rootRoute = createRootRoute({
        component: Outlet,
      })

      const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Story,
      })

      const tourEditRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/tours/$nanoId/edit',
        component: () => null,
      })

      const router = createRouter({
        routeTree: rootRoute.addChildren([indexRoute, tourEditRoute]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
      })

      return (
        <RouterProvider router={router} defaultPendingComponent={() => null} defaultNotFoundComponent={() => null} />
      )
    },
  ],
} satisfies Meta<typeof DeleteThemeDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    themeName: 'Modern Museum',
  },
}

export const DifferentTheme: Story = {
  args: {
    open: true,
    themeName: 'Classical Dark',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    themeName: 'Vintage Light',
    isLoading: true,
  },
}

export const LoadingUsage: Story = {
  args: {
    open: true,
    themeName: 'Exhibition Serif',
    onGetUsage: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return unusedThemeUsage
    }),
  },
}

export const UsedByTours: Story = {
  args: {
    open: true,
    themeName: 'Modern Museum',
    onGetUsage: fn(
      async (): Promise<ThemeUsageDetails> => ({
        isWorkspaceDefault: false,
        tours: [
          { id: 'tour-1', nanoId: 'tourNano1', name: 'Main Collection Highlights', scope: 'draftAndPublished' },
          { id: 'tour-2', nanoId: 'tourNano2', name: 'Impressionist Trail', scope: 'draft' },
        ],
      }),
    ),
  },
}

export const UsedAsWorkspaceDefault: Story = {
  args: {
    open: true,
    themeName: 'House Style',
    onGetUsage: fn(
      async (): Promise<ThemeUsageDetails> => ({
        isWorkspaceDefault: true,
        tours: [],
      }),
    ),
  },
}

export const UsedByToursAndDefaultTheme: Story = {
  args: {
    open: true,
    themeName: 'Museum House Style',
    onGetUsage: fn(
      async (): Promise<ThemeUsageDetails> => ({
        isWorkspaceDefault: true,
        tours: [{ id: 'tour-1', nanoId: 'tourNano1', name: 'Main Collection Highlights', scope: 'draftAndPublished' }],
      }),
    ),
  },
}

export const Closed: Story = {
  args: {
    open: false,
    themeName: 'Minimal Design',
  },
}
