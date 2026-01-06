import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { GuidesList } from '@/features/guides/components/guides-list'

const meta: Meta<typeof GuidesList> = {
  title: 'Studio/Guides/GuidesList',
  component: GuidesList,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'padded',
    docs: {
      description: {
        component:
          'A component that displays a list of guides with an empty state when no guides exist. Prompts users to create their first guide.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Sample guides data
const sampleGuides: GuideWithTranslations[] = [
  {
    id: '1',
    nanoId: '1',
    organizationId: 'org-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    themeId: null,
    archivedAt: null,
    deletedAt: null,
    published: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    translations: [
      {
        id: 't1',
        guideId: '1',
        locale: 'en',
        currentVersionId: 'v1',
        draftVersionId: 'v1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        currentVersion: {
          id: 'v1',
          translationId: 't1',
          title: 'Ancient Egypt Exhibition',
          description: 'Explore the wonders of Ancient Egypt.',
          status: 'published',
          version: 1,
          createdAt: new Date('2024-01-15'),
          createdBy: 'user-1',
          publishedAt: new Date('2024-01-15'),
        },
      },
    ],
  },
  {
    id: '2',
    nanoId: '2',
    organizationId: 'org-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    themeId: null,
    archivedAt: null,
    deletedAt: null,
    published: null,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    translations: [
      {
        id: 't2',
        guideId: '2',
        locale: 'en',
        currentVersionId: 'v2',
        draftVersionId: 'v2',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        currentVersion: {
          id: 'v2',
          translationId: 't2',
          title: 'Modern Art Gallery Tour',
          description: 'A comprehensive multimedia guide.',
          status: 'published',
          version: 1,
          createdAt: new Date('2024-02-01'),
          createdBy: 'user-1',
          publishedAt: new Date('2024-02-01'),
        },
      },
    ],
  },
]

export const Empty: Story = {
  args: {
    guides: [],
    isLoading: false,
    error: null,
  },
}

export const Loading: Story = {
  args: {
    guides: [],
    isLoading: true,
    error: null,
  },
}

export const ErrorState: Story = {
  args: {
    guides: [],
    isLoading: false,
    error: { message: 'Failed to connect to the database. Please check your connection and try again.' } as Error,
  },
}

export const WithGuides: Story = {
  args: {
    guides: sampleGuides,
    isLoading: false,
    error: null,
  },
}

export const SingleGuide: Story = {
  args: {
    guides: sampleGuides.slice(0, 1),
    isLoading: false,
    error: null,
  },
}

export const WithCreateHandler: Story = {
  args: {
    guides: [],
    isLoading: false,
    error: null,
    onCreateGuide: async () => {
      console.log('Create guide clicked!')
      alert('Create guide clicked!')
      return {} as GuideWithTranslations
    },
  },
}
