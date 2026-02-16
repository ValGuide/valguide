import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { MobileSavePublish } from './mobile-action-bar'

const meta = {
  title: 'Studio/Editor/MobileSavePublish',
  component: MobileSavePublish,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  tags: ['autodocs'],
  args: {
    hasDraft: true,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    onSave: fn(),
    onPublishClick: fn(),
  },
} satisfies Meta<typeof MobileSavePublish>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithChanges: Story = {
  args: { isDirty: true },
}

export const Saving: Story = {
  args: { isDirty: true, isSaving: true },
}

export const Publishing: Story = {
  args: { isPublishing: true },
}

export const PublishingDisabled: Story = {
  args: { publishingDisabled: true },
}
