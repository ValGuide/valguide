import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { VersionHistoryDialog } from './version-history-dialog'

const meta = {
  title: 'Features/Guides/VersionHistoryDialog',
  component: VersionHistoryDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
  play: async () => {
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
