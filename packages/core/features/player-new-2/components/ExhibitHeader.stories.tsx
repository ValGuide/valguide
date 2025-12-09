import type { Meta, StoryObj } from '@storybook/react'
import { ExhibitHeader } from './ExhibitHeader'

const meta: Meta<typeof ExhibitHeader> = {
  title: 'Player New 2/ExhibitHeader',
  component: ExhibitHeader,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-white p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ExhibitHeader>

export const Default: Story = {
  args: {
    title: '01. The Great White',
    subtitle: 'Steinhart Aquarium',
  },
}

export const LongTitle: Story = {
  args: {
    title: '15. The Amazing Journey of the Pacific Ocean Giants',
    subtitle: 'California Academy of Sciences',
  },
}
