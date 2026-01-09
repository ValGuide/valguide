import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import type { StopTranslationVersion } from '../schema'
import { VersionHistoryDialogStop } from './version-history-dialog-stop'

// Mock version history data for stops
const mockStopVersionHistory: StopTranslationVersion[] = [
  {
    id: 'version-1',
    translationId: 'trans-1',
    version: 3,
    status: 'published',
    title: 'The Great Sphinx - Updated',
    description: 'Comprehensive guide to the Great Sphinx with latest archaeological findings',
    transcription: 'Welcome to the Great Sphinx...',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-03-15T14:00:00Z'),
  },
  {
    id: 'version-2',
    translationId: 'trans-1',
    version: 2,
    status: 'archived',
    title: 'The Great Sphinx',
    description: 'Updated descriptions for the sphinx',
    transcription: 'Welcome to the Great Sphinx of Giza...',
    createdAt: new Date('2024-03-10T09:00:00Z'),
    createdBy: 'user-2',
    publishedAt: new Date('2024-03-10T16:00:00Z'),
  },
  {
    id: 'version-3',
    translationId: 'trans-1',
    version: 1,
    status: 'archived',
    title: 'The Great Sphinx',
    description: 'Initial stop description',
    transcription: null,
    createdAt: new Date('2024-02-20T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-02-20T14:00:00Z'),
  },
]

const _mockDraftHistory: StopTranslationVersion[] = [
  {
    id: 'version-1',
    translationId: 'trans-1',
    version: 2,
    status: 'draft',
    title: 'The Great Sphinx - Work in Progress',
    description: 'Currently being edited with new information',
    transcription: 'Updated transcription...',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    createdBy: 'user-1',
    publishedAt: null,
  },
  {
    id: 'version-2',
    translationId: 'trans-1',
    version: 1,
    status: 'published',
    title: 'The Great Sphinx',
    description: 'Original published version',
    transcription: 'Welcome to the Great Sphinx...',
    createdAt: new Date('2024-03-10T09:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-03-10T16:00:00Z'),
  },
]

// Mock the server action functions
const _mockGetStopTranslationHistory = async (stopId: string, locale: string) => {
  console.log('Fetching stop history:', { stopId, locale })
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockStopVersionHistory
}

const _mockRollbackStopTranslation = async (stopId: string, locale: string, targetVersion: number) => {
  console.log('Rolling back stop:', { stopId, locale, targetVersion })
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
  },
}

export const WithDraftVersions: Story = {
  args: {
    stopId: 'stop-draft',
    locale: 'en',
    onRollback: fn(),
  },
}

export const LoadingError: Story = {
  args: {
    stopId: 'stop-error',
    locale: 'en',
    onRollback: fn(),
  },
}

export const RollbackError: Story = {
  args: {
    stopId: 'stop-rollback-error',
    locale: 'en',
    onRollback: fn(),
  },
}
