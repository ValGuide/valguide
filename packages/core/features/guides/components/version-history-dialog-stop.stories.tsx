import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { VersionHistoryDialogStop } from './version-history-dialog-stop'

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
