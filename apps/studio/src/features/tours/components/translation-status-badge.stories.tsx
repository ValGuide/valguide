import type { Meta, StoryObj } from '@storybook/react'
import { TranslationStatusBadge } from './translation-status-badge'

const meta = {
  title: 'Features/Tours/TranslationStatusBadge',
  component: TranslationStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TranslationStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Draft: Story = {
  args: {
    status: 'draft',
    hasDraft: false,
  },
}

export const InReview: Story = {
  args: {
    status: 'in_review',
    hasDraft: false,
  },
}

export const Published: Story = {
  args: {
    status: 'published',
    hasDraft: false,
  },
}

export const Archived: Story = {
  args: {
    status: 'archived',
    hasDraft: false,
  },
}

export const PublishedWithDraft: Story = {
  args: {
    status: 'published',
    hasDraft: true,
  },
}

export const NoContent: Story = {
  args: {
    status: null,
    hasDraft: false,
  },
}

export const UndefinedStatus: Story = {
  args: {
    status: undefined,
    hasDraft: false,
  },
}

export const NullStatusWithoutDraft: Story = {
  args: {
    status: null,
    hasDraft: undefined,
  },
}
