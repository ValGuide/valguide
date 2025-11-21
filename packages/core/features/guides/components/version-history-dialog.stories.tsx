import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { VersionHistoryDialog } from './version-history-dialog'

import type { GuideTranslationVersion } from '../schema'

// Import messages for the story
import enMessages from '@valguide/i18n/messages/en.json'
import deMessages from '@valguide/i18n/messages/de.json'
import rmMessages from '@valguide/i18n/messages/rm.json'

// Mock version history data
const mockVersionHistory: GuideTranslationVersion[] = [
  {
    id: 'version-1',
    translationId: 'trans-1',
    version: 5,
    status: 'published',
    title: 'Ancient Egypt Exhibition - Latest',
    description: 'Fully updated with new artifacts and discoveries',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-03-15T14:00:00Z'),
  },
  {
    id: 'version-2',
    translationId: 'trans-1',
    version: 4,
    status: 'archived',
    title: 'Ancient Egypt Exhibition',
    description: 'Updated descriptions for key exhibits',
    createdAt: new Date('2024-03-10T09:00:00Z'),
    createdBy: 'user-2',
    publishedAt: new Date('2024-03-10T16:00:00Z'),
  },
  {
    id: 'version-3',
    translationId: 'trans-1',
    version: 3,
    status: 'archived',
    title: 'Ancient Egypt Exhibition',
    description: 'Minor text corrections',
    createdAt: new Date('2024-03-05T11:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-03-05T15:00:00Z'),
  },
  {
    id: 'version-4',
    translationId: 'trans-1',
    version: 2,
    status: 'archived',
    title: 'Ancient Egypt Exhibition',
    description: 'Added new stop descriptions',
    createdAt: new Date('2024-02-28T08:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-02-28T12:00:00Z'),
  },
  {
    id: 'version-5',
    translationId: 'trans-1',
    version: 1,
    status: 'archived',
    title: 'Ancient Egypt',
    description: 'Initial version',
    createdAt: new Date('2024-02-20T10:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-02-20T14:00:00Z'),
  },
]

const mockEmptyHistory: GuideTranslationVersion[] = []

const mockDraftHistory: GuideTranslationVersion[] = [
  {
    id: 'version-1',
    translationId: 'trans-1',
    version: 2,
    status: 'draft',
    title: 'Work in Progress',
    description: 'Currently being edited',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    createdBy: 'user-1',
    publishedAt: null,
  },
  {
    id: 'version-2',
    translationId: 'trans-1',
    version: 1,
    status: 'published',
    title: 'Ancient Egypt Exhibition',
    description: 'Original published version',
    createdAt: new Date('2024-03-10T09:00:00Z'),
    createdBy: 'user-1',
    publishedAt: new Date('2024-03-10T16:00:00Z'),
  },
]

// Mock the server action functions
const mockGetGuideTranslationHistory = async (guideId: string, locale: string) => {
  console.log('Fetching history:', { guideId, locale })
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockVersionHistory
}

const mockRollbackGuideTranslation = async (guideId: string, locale: string, targetVersion: number) => {
  console.log('Rolling back:', { guideId, locale, targetVersion })
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
  decorators: [
    (Story, { globals: { locale } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      const currentLocale = locale || 'en'

      return (
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <Story />
        </NextIntlClientProvider>
      )
    },
  ],
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
  play: async ({ canvasElement }) => {
    // Auto-click the button to open the dialog in the story
    // This requires user interaction in actual Storybook
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

export const GermanLocale: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'de',
    onRollback: fn(),
  },
  globals: {
    locale: 'de',
  },
}

export const RomanshLocale: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'rm',
    onRollback: fn(),
  },
  globals: {
    locale: 'rm',
  },
}

// Story with empty history
export const EmptyHistory: Story = {
  args: {
    guideId: 'guide-empty',
    locale: 'en',
    onRollback: fn(),
  },
}

// Story with draft versions
export const WithDraftVersions: Story = {
  args: {
    guideId: 'guide-draft',
    locale: 'en',
    onRollback: fn(),
  },
}

// Story simulating loading error
export const LoadingError: Story = {
  args: {
    guideId: 'guide-error',
    locale: 'en',
    onRollback: fn(),
  },
}

// Story simulating rollback error
export const RollbackError: Story = {
  args: {
    guideId: 'guide-rollback-error',
    locale: 'en',
    onRollback: fn(),
  },
}
