import type { Meta, StoryObj } from '@storybook/react'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import type { GuideListItem } from '@valguide/core/features/guides/types'
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

// Sample guides data using the lightweight GuideListItem type
const sampleGuides: GuideListItem[] = [
  {
    id: '1',
    nanoId: '1',
    published: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    coverImageUrl: null,
    displayTitle: 'Ancient Egypt Exhibition',
    displayDescription: 'Explore the wonders of Ancient Egypt.',
    displayLocale: 'en',
  },
  {
    id: '2',
    nanoId: '2',
    published: null,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    coverImageUrl: null,
    displayTitle: 'Modern Art Gallery Tour',
    displayDescription: 'A comprehensive multimedia guide.',
    displayLocale: 'en',
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
