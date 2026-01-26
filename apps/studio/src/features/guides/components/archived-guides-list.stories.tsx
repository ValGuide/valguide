import type { Meta, StoryObj } from '@storybook/react'
import type { ArchivedGuideListItem } from '@valguide/core/features/guides/guide/list-archived-guides.fn'
import { fn } from 'storybook/test'
import { ArchivedGuidesList } from './archived-guides-list'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const meta: Meta<typeof ArchivedGuidesList> = {
  title: 'Studio/Guides/ArchivedGuidesList',
  component: ArchivedGuidesList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays a list of archived guides with options to recover or permanently delete them.',
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

const archivedGuides: ArchivedGuideListItem[] = [
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
    guides: [],
  },
}

export const WithArchivedGuides: Story = {
  args: {
    guides: archivedGuides,
  },
}

export const SingleGuide: Story = {
  args: {
    guides: archivedGuides.slice(0, 1),
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const ErrorState: Story = {
  args: {
    error: new globalThis.Error('Failed to load archived guides'),
    onRetry: () => {
      console.log('Retry clicked!')
    },
  },
}
