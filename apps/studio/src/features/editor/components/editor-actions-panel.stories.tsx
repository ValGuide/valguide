import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { EditorActionsPanel } from './editor-actions-panel'

const meta = {
  title: 'Studio/Editor/EditorActionsPanel',
  component: EditorActionsPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-64 rounded-lg border bg-background p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onSave: fn(),
    onPublishClick: fn(),
    onUnpublishClick: fn(),
    onDiscardClick: fn(),
  },
} satisfies Meta<typeof EditorActionsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Unpublished: Story = {
  args: {
    hasDraft: true,
    hasPublished: false,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
  },
}

export const UnpublishedWithChanges: Story = {
  args: {
    hasDraft: true,
    hasPublished: false,
    isDirty: true,
    isSaving: false,
    isPublishing: false,
  },
}

export const Published: Story = {
  args: {
    hasDraft: true,
    hasPublished: true,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
  },
}

export const PublishedWithChanges: Story = {
  args: {
    hasDraft: true,
    hasPublished: true,
    isDirty: true,
    isSaving: false,
    isPublishing: false,
  },
}

export const Saving: Story = {
  args: {
    hasDraft: true,
    hasPublished: false,
    isDirty: true,
    isSaving: true,
    isPublishing: false,
  },
}

export const Publishing: Story = {
  args: {
    hasDraft: true,
    hasPublished: false,
    isDirty: false,
    isSaving: false,
    isPublishing: true,
  },
}
