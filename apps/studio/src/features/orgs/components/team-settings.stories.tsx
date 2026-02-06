import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { type SlugCheckResult, TeamSettings, type UpdateSlugResult } from './team-settings'

const meta: Meta<typeof TeamSettings> = {
  title: 'Core/Orgs/TeamSettings',
  component: TeamSettings,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Team settings card for managing team identity and URL slug. Includes debounced slug availability checking and slug history display.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof TeamSettings>

const mockTeam = {
  id: 'team-123',
  name: 'Kunsthaus Zürich',
}

const mockSlugHistory = [
  {
    id: 'slug-1',
    slug: 'kunsthaus-zuerich',
    isPrimary: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'slug-2',
    slug: 'kunsthaus-zurich',
    isPrimary: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'slug-3',
    slug: 'kh-zuerich',
    isPrimary: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const createMockCheckSlugAvailable = (scenario: 'available' | 'taken' | 'reserved' | 'self') => {
  return async (_slug: string): Promise<SlugCheckResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    switch (scenario) {
      case 'available':
        return { available: true }
      case 'taken':
        return { available: false, takenBy: 'other' }
      case 'reserved':
        return { available: false, takenBy: 'reserved' }
      case 'self':
        return { available: false, takenBy: 'self' }
    }
  }
}

const createMockUpdateSlug = (success: boolean) => {
  return async (): Promise<UpdateSlugResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (success) {
      return { success: true }
    }
    return {
      success: false,
      error: 'SLUG_TAKEN',
      message: 'This slug is already taken',
    }
  }
}

export const Default: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: mockSlugHistory,
    onCheckSlugAvailable: createMockCheckSlugAvailable('available'),
    onUpdateSlug: createMockUpdateSlug(true),
  },
}

export const NoSlug: Story = {
  args: {
    team: mockTeam,
    initialSlug: undefined,
    slugHistory: [],
    onCheckSlugAvailable: createMockCheckSlugAvailable('available'),
    onUpdateSlug: createMockUpdateSlug(true),
  },
  parameters: {
    docs: {
      description: {
        story: 'Team without an existing slug. User can set their first slug.',
      },
    },
  },
}

export const SlugTaken: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: mockSlugHistory,
    onCheckSlugAvailable: createMockCheckSlugAvailable('taken'),
    onUpdateSlug: createMockUpdateSlug(false),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the "taken" state when checking a slug that belongs to another organization.',
      },
    },
  },
}

export const SlugReserved: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: mockSlugHistory,
    onCheckSlugAvailable: createMockCheckSlugAvailable('reserved'),
    onUpdateSlug: createMockUpdateSlug(false),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the "reserved" state for system-reserved slugs like "admin", "api", etc.',
      },
    },
  },
}

export const CurrentSlug: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: mockSlugHistory,
    onCheckSlugAvailable: createMockCheckSlugAvailable('self'),
    onUpdateSlug: createMockUpdateSlug(true),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows when user checks their own current slug.',
      },
    },
  },
}

export const NoHistory: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: [
      {
        id: 'slug-1',
        slug: 'kunsthaus-zuerich',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ],
    onCheckSlugAvailable: createMockCheckSlugAvailable('available'),
    onUpdateSlug: createMockUpdateSlug(true),
  },
  parameters: {
    docs: {
      description: {
        story: 'Team with only one slug (no history to show).',
      },
    },
  },
}

export const LongHistory: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: [
      {
        id: 'slug-1',
        slug: 'kunsthaus-zuerich',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'slug-2',
        slug: 'kunsthaus-zurich',
        isPrimary: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'slug-3',
        slug: 'kh-zuerich',
        isPrimary: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'slug-4',
        slug: 'kunsthaus',
        isPrimary: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'slug-5',
        slug: 'kh-zh',
        isPrimary: false,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    onCheckSlugAvailable: createMockCheckSlugAvailable('available'),
    onUpdateSlug: createMockUpdateSlug(true),
  },
  parameters: {
    docs: {
      description: {
        story: 'Team with extensive slug history.',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    team: mockTeam,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton state while fetching slug data.',
      },
    },
  },
}

export const WithActionCallbacks: Story = {
  args: {
    team: mockTeam,
    initialSlug: 'kunsthaus-zuerich',
    slugHistory: mockSlugHistory,
    onCheckSlugAvailable: fn(),
    onUpdateSlug: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'With action callbacks for Storybook actions panel testing.',
      },
    },
  },
}
