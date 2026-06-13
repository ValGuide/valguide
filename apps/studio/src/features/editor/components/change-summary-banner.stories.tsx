import type { Meta, StoryObj } from '@storybook/react'
import { ChangeSummaryBanner } from './change-summary-banner'

const meta: Meta<typeof ChangeSummaryBanner> = {
  title: 'Studio/Editor/ChangeSummaryBanner',
  component: ChangeSummaryBanner,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChangeSummaryBanner>

export const SingleChange: Story = {
  args: {
    changedCount: 1,
    changedFields: ['title'],
  },
}

export const MultipleChanges: Story = {
  args: {
    changedCount: 3,
    changedFields: ['title', 'description', 'transcription'],
  },
}

export const WithLabels: Story = {
  args: {
    changedCount: 2,
    changedFields: ['title', 'description'],
    fieldLabels: {
      title: 'Title *',
      description: 'Description',
    },
  },
}

export const NoChanges: Story = {
  args: {
    changedCount: 0,
    changedFields: [],
  },
}
