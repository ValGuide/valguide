import type { Meta, StoryObj } from '@storybook/react'
import { PlaybackOptions } from './PlaybackOptions'

const meta: Meta<typeof PlaybackOptions> = {
  title: 'Player New 2/PlaybackOptions',
  component: PlaybackOptions,
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
type Story = StoryObj<typeof PlaybackOptions>

export const Default: Story = {
  args: {
    playbackSpeed: 1.0,
  },
}

export const FastSpeed: Story = {
  args: {
    playbackSpeed: 1.5,
  },
}

export const SlowSpeed: Story = {
  args: {
    playbackSpeed: 0.75,
  },
}
