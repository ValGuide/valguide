import type { Meta, StoryObj } from '@storybook/react'
import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { ToursList } from '@/features/tours/components/tours-list'

const meta: Meta<typeof ToursList> = {
  title: 'Studio/Tours/ToursList',
  component: ToursList,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'padded',
    docs: {
      description: {
        component:
          'A component that displays a list of tours with an empty state when no tours exist. Prompts users to create their first tour.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Sample tours data using the lightweight TourListItem type
const sampleTours: TourListItem[] = [
  {
    nanoId: 'tour1abc',
    title: 'Ancient Egypt Exhibition',
    locale: 'en',
    availableLocales: ['en', 'de'],
    archivedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    nanoId: 'tour2xyz',
    title: 'Modern Art Gallery Tour',
    locale: 'en',
    availableLocales: ['en'],
    archivedAt: null,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
]

export const Empty: Story = {
  args: {
    tours: [],
    isLoading: false,
    error: null,
  },
}

export const Loading: Story = {
  args: {
    tours: [],
    isLoading: true,
    error: null,
  },
}

export const ErrorState: Story = {
  args: {
    tours: [],
    isLoading: false,
    error: { message: 'Failed to connect to the database. Please check your connection and try again.' } as Error,
  },
}

export const WithTours: Story = {
  args: {
    tours: sampleTours,
    isLoading: false,
    error: null,
  },
}

export const SingleTour: Story = {
  args: {
    tours: sampleTours.slice(0, 1),
    isLoading: false,
    error: null,
  },
}

export const WithCreateHandler: Story = {
  args: {
    tours: [],
    isLoading: false,
    error: null,
    onCreateTour: async () => {
      console.log('Create tour clicked!')
      alert('Create tour clicked!')
      return { nanoId: 'new-tour' }
    },
  },
}
