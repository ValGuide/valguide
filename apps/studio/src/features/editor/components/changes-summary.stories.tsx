import type { Meta, StoryObj } from '@storybook/react'
import { ChangesSummary } from './changes-summary'

const meta: Meta<typeof ChangesSummary> = {
  title: 'Studio/Editor/ChangesSummary',
  component: ChangesSummary,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ChangesSummary>

export const NoChanges: Story = {
  args: {
    changedCount: 0,
    publishedAt: new Date(),
  },
}

export const SingleChange: Story = {
  args: {
    changedCount: 1,
    publishedAt: new Date(),
  },
}

export const MultipleChanges: Story = {
  args: {
    changedCount: 3,
    publishedAt: new Date(),
  },
}

export const NeverPublished: Story = {
  args: {
    changedCount: 2,
    publishedAt: null,
  },
}
