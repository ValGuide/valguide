import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DraftPublishedTabs } from './draft-published-tabs'

const meta = {
  title: 'Studio/Editor/DraftPublishedTabs',
  component: DraftPublishedTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="rounded-lg border bg-background p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onTabChange: fn(),
  },
} satisfies Meta<typeof DraftPublishedTabs>

export default meta
type Story = StoryObj<typeof meta>

export const DraftTabActive: Story = {
  args: {
    activeTab: 'draft',
    hasDraft: true,
    hasPublished: true,
  },
}

export const PublishedTabActive: Story = {
  args: {
    activeTab: 'published',
    hasDraft: true,
    hasPublished: true,
  },
}

export const OnlyDraft: Story = {
  args: {
    activeTab: 'draft',
    hasDraft: true,
    hasPublished: false,
  },
}

export const PublishedTabDisabled: Story = {
  args: {
    activeTab: 'draft',
    hasDraft: true,
    hasPublished: false,
  },
}
