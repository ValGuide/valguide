import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import type { RollbackResult, VersionHistoryItemRaw, VersionHistoryResult } from './version-history-dialog'
import { VersionHistoryDialog } from './version-history-dialog'

const mockVersionsRaw: VersionHistoryItemRaw[] = [
  {
    id: 'v1',
    translationId: 't1',
    version: 3,
    title: 'City Walking Tour',
    description: 'Explore the historic downtown area with expert guides.',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-01-15T12:00:00Z'),
  },
  {
    id: 'v2',
    translationId: 't1',
    version: 2,
    title: 'City Walking Tour',
    description: 'Explore the historic downtown area.',
    createdAt: new Date('2024-01-10T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-01-10T14:00:00Z'),
  },
  {
    id: 'v3',
    translationId: 't1',
    version: 1,
    title: 'Downtown Tour',
    description: 'Initial draft',
    createdAt: new Date('2024-01-05T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: null,
  },
]

const mockGetHistory = async (): Promise<VersionHistoryResult> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    versions: mockVersionsRaw,
    currentVersionId: 'v1', // v1 is published
    draftVersionId: null, // No draft
  }
}

const mockRollbackAction = async (): Promise<RollbackResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

const meta = {
  title: 'Features/Guides/VersionHistoryDialog',
  component: VersionHistoryDialog,
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
} satisfies Meta<typeof VersionHistoryDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    onRollback: fn(),
  },
}

export const WithCallback: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    onRollback: () => {
      console.log('Rollback completed callback')
    },
  },
}

export const EmptyHistory: Story = {
  args: {
    guideId: 'guide-empty',
    locale: 'en',
    onRollback: fn(),
    onGetHistory: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { versions: [], currentVersionId: null, draftVersionId: null }
    },
  },
}

export const WithDraftVersions: Story = {
  args: {
    guideId: 'guide-draft',
    locale: 'en',
    onRollback: fn(),
    onGetHistory: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Draft version is v4, no published version
      return {
        versions: [
          {
            id: 'v4',
            translationId: 't1',
            version: 4,
            title: 'Draft version',
            description: 'Work in progress',
            createdAt: new Date('2024-01-20T10:00:00Z'),
            createdBy: 'user-1',
            publishedAt: null,
          },
          ...mockVersionsRaw.slice(0, 2),
        ],
        currentVersionId: null,
        draftVersionId: 'v4',
      }
    },
  },
}

export const LoadingError: Story = {
  args: {
    guideId: 'guide-error',
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
    guideId: 'guide-rollback-error',
    locale: 'en',
    onRollback: fn(),
    onRollbackAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, error: 'Version conflict detected' }
    },
  },
}
