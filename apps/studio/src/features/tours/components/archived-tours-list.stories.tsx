import type { Meta, StoryObj } from '@storybook/react'
import type { ArchivedTourListItem } from '@valguide/core/features/tours/tour/list-archived-tours.fn'
import { fn } from 'storybook/test'
import { ArchivedToursList } from './archived-tours-list'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const meta: Meta<typeof ArchivedToursList> = {
  title: 'Studio/Tours/ArchivedToursList',
  component: ArchivedToursList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays a list of archived tours with options to recover or permanently delete them.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onRecover: fn(async () => {
      await delay(500)
    }),
    onDelete: fn(async () => {
      await delay(500)
    }),
  },
}

export default meta
type Story = StoryObj<typeof meta>

const archivedTours: ArchivedTourListItem[] = [
  {
    nanoId: 'abc123',
    title: 'Ancient Egypt Exhibition',
    locale: 'en',
    availableLocales: ['en'],
    archivedAt: new Date('2024-12-01'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    nanoId: 'def456',
    title: 'Modern Art Gallery Tour',
    locale: 'en',
    availableLocales: ['en', 'de'],
    archivedAt: new Date('2024-11-15'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    nanoId: 'ghi789',
    title: 'Historic City Walking Tour',
    locale: 'en',
    availableLocales: ['en'],
    archivedAt: new Date('2024-10-20'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-10'),
  },
]

export const Empty: Story = {
  args: {
    tours: [],
  },
}

export const WithArchivedTours: Story = {
  args: {
    tours: archivedTours,
  },
}

export const SingleTour: Story = {
  args: {
    tours: archivedTours.slice(0, 1),
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const ErrorState: Story = {
  args: {
    error: new globalThis.Error('Failed to load archived tours'),
    onRetry: () => {
      console.log('Retry clicked!')
    },
  },
}
