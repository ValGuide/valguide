import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Player New 2/ProgressBar',
  component: ProgressBar,
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
type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  args: {
    currentTime: 45,
    duration: 180,
    onSeek: (time) => console.log('Seek to:', time),
  },
}

export const Beginning: Story = {
  args: {
    currentTime: 0,
    duration: 180,
    onSeek: (time) => console.log('Seek to:', time),
  },
}

export const Middle: Story = {
  args: {
    currentTime: 90,
    duration: 180,
    onSeek: (time) => console.log('Seek to:', time),
  },
}

export const NearEnd: Story = {
  args: {
    currentTime: 165,
    duration: 180,
    onSeek: (time) => console.log('Seek to:', time),
  },
}
