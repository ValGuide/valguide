import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import type { StopRollbackResult, StopVersionHistoryItem } from './version-history-dialog-stop'
import { VersionHistoryDialogStop } from './version-history-dialog-stop'

const mockVersions: StopVersionHistoryItem[] = [
  {
    id: 'v1',
    translationId: 't1',
    version: 3,
    status: 'published',
    title: 'Historic Cathedral',
    description: 'Visit the beautiful 12th century cathedral.',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-01-15T12:00:00Z'),
  },
  {
    id: 'v2',
    translationId: 't1',
    version: 2,
    status: 'published',
    title: 'Historic Cathedral',
    description: 'Visit the cathedral.',
    createdAt: new Date('2024-01-10T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-01-10T14:00:00Z'),
  },
  {
    id: 'v3',
    translationId: 't1',
    version: 1,
    status: 'draft',
    title: 'Old Church',
    description: 'Initial draft',
    createdAt: new Date('2024-01-05T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: null,
  },
]

const mockGetHistory = async (): Promise<StopVersionHistoryItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockVersions
}

const mockRollbackAction = async (): Promise<StopRollbackResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

const meta = {
  title: 'Features/Guides/VersionHistoryDialogStop',
  component: VersionHistoryDialogStop,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onGetHistory: mockGetHistory,
    onRollbackAction: mockRollbackAction,
  },
  argTypes: {
    onRollback: { action: 'rollback' },
  },
} satisfies Meta<typeof VersionHistoryDialogStop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    onRollback: fn(),
  },
}

export const WithCallback: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    onRollback: () => {
      console.log('Stop rollback completed callback')
    },
  },
}

export const EmptyHistory: Story = {
  args: {
    stopId: 'stop-empty',
    locale: 'en',
    onRollback: fn(),
    onGetHistory: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return []
    },
  },
}

export const WithDraftVersions: Story = {
  args: {
    stopId: 'stop-draft',
    locale: 'en',
    onRollback: fn(),
    onGetHistory: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return [
        {
          ...mockVersions[0],
          status: 'draft' as const,
          publishedAt: null,
        },
        ...mockVersions.slice(1),
      ]
    },
  },
}

export const LoadingError: Story = {
  args: {
    stopId: 'stop-error',
    locale: 'en',
    onRollback: fn(),
    onGetHistory: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      throw new Error('Failed to load history')
    },
  },
}

export const RollbackError: Story = {
  args: {
    stopId: 'stop-rollback-error',
    locale: 'en',
    onRollback: fn(),
    onRollbackAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, error: 'Version conflict detected' }
    },
  },
}
