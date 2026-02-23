import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { PublishStatusBanner } from './publish-status-banner'

const meta = {
  title: 'Editor/PublishStatusBanner',
  component: PublishStatusBanner,
  args: {
    onPublish: fn(),
    onDiscard: fn(),
  },
} satisfies Meta<typeof PublishStatusBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Draft: Story = {
  args: { state: 'draft' },
}

export const Published: Story = {
  args: { state: 'published', publishedAt: new Date() },
}

export const PublishedWithoutDate: Story = {
  args: { state: 'published', publishedAt: null },
}

export const UnpublishedChanges: Story = {
  args: { state: 'unpublished-changes' },
}

export const PublishingDisabled: Story = {
  args: { state: 'draft', publishingDisabled: true },
}

export const Publishing: Story = {
  args: { state: 'unpublished-changes', isPublishing: true },
}
