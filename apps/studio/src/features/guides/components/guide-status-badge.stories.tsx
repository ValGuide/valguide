import type { Meta, StoryObj } from '@storybook/react'
import { GuideStatusBadge } from './guide-status-badge'

const meta = {
  title: 'Features/Guides/GuideStatusBadge',
  component: GuideStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GuideStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const PublishedUpToDate: Story = {
  args: {
    status: 'published',
    indicator: 'up-to-date',
  },
}

export const PublishedChanged: Story = {
  args: {
    status: 'published',
    indicator: 'changed',
  },
}

export const PublishedNoIndicator: Story = {
  args: {
    status: 'published',
    indicator: null,
  },
}

export const Unpublished: Story = {
  args: {
    status: 'unpublished',
  },
}

export const Archived: Story = {
  args: {
    status: 'archived',
  },
}

export const SmallSize: Story = {
  args: {
    status: 'published',
    indicator: 'up-to-date',
    size: 'sm',
  },
}

export const LargeSize: Story = {
  args: {
    status: 'published',
    indicator: 'changed',
    size: 'lg',
  },
}

export const AllStatuses: Story = {
  args: {
    status: 'published',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <GuideStatusBadge status="published" indicator="up-to-date" />
        <span className="text-sm text-muted-foreground">Published · Up to date</span>
      </div>
      <div className="flex items-center gap-2">
        <GuideStatusBadge status="published" indicator="changed" />
        <span className="text-sm text-muted-foreground">Published · Changed</span>
      </div>
      <div className="flex items-center gap-2">
        <GuideStatusBadge status="unpublished" />
        <span className="text-sm text-muted-foreground">Unpublished</span>
      </div>
      <div className="flex items-center gap-2">
        <GuideStatusBadge status="archived" />
        <span className="text-sm text-muted-foreground">Archived</span>
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  args: {
    status: 'published',
  },
  render: () => (
    <div className="flex items-center gap-4">
      <GuideStatusBadge status="published" indicator="up-to-date" size="sm" />
      <GuideStatusBadge status="published" indicator="up-to-date" size="md" />
      <GuideStatusBadge status="published" indicator="up-to-date" size="lg" />
    </div>
  ),
}
