import type { Meta, StoryObj } from '@storybook/react'
import { ChangedFieldIndicator } from './changed-field-indicator'

const meta: Meta<typeof ChangedFieldIndicator> = {
  title: 'Studio/Editor/ChangedFieldIndicator',
  component: ChangedFieldIndicator,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">Field Label</span>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChangedFieldIndicator>

export const Changed: Story = {
  args: {
    hasChanged: true,
    isNew: false,
  },
}

export const New: Story = {
  args: {
    hasChanged: true,
    isNew: true,
  },
}

export const Unchanged: Story = {
  args: {
    hasChanged: false,
  },
}
