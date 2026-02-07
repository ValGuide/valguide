import type { Meta, StoryObj } from '@storybook/react'
import { TourStatusBadge } from './tour-status-badge'

const meta = {
  title: 'Features/Tours/TourStatusBadge',
  component: TourStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TourStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Live: Story = {
  args: {
    status: 'published',
    indicator: 'up-to-date',
  },
}

export const LiveWithUnpublishedEdits: Story = {
  args: {
    status: 'published',
    indicator: 'changed',
  },
}

export const NotLive: Story = {
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
        <TourStatusBadge status="published" indicator="up-to-date" />
        <span className="text-sm text-muted-foreground">Published (no pending edits)</span>
      </div>
      <div className="flex items-center gap-2">
        <TourStatusBadge status="published" indicator="changed" />
        <span className="text-sm text-muted-foreground">Published with unpublished edits</span>
      </div>
      <div className="flex items-center gap-2">
        <TourStatusBadge status="unpublished" />
        <span className="text-sm text-muted-foreground">Not published</span>
      </div>
      <div className="flex items-center gap-2">
        <TourStatusBadge status="archived" />
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <TourStatusBadge status="published" indicator="changed" size="sm" />
        <TourStatusBadge status="published" indicator="changed" size="md" />
        <TourStatusBadge status="published" indicator="changed" size="lg" />
      </div>
      <div className="flex items-center gap-4">
        <TourStatusBadge status="published" indicator="up-to-date" size="sm" />
        <TourStatusBadge status="published" indicator="up-to-date" size="md" />
        <TourStatusBadge status="published" indicator="up-to-date" size="lg" />
      </div>
    </div>
  ),
}
