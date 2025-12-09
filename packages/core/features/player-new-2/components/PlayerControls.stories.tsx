import type { Meta, StoryObj } from '@storybook/react'
import { PlayerControls } from './PlayerControls'

const meta: Meta<typeof PlayerControls> = {
  title: 'Player New 2/PlayerControls',
  component: PlayerControls,
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
type Story = StoryObj<typeof PlayerControls>

export const Paused: Story = {
  args: {
    isPlaying: false,
    onPlayPause: () => console.log('Play/Pause'),
    onRewind: () => console.log('Rewind'),
    onForward: () => console.log('Forward'),
    onSkipPrevious: () => console.log('Previous'),
    onSkipNext: () => console.log('Next'),
  },
}

export const Playing: Story = {
  args: {
    isPlaying: true,
    onPlayPause: () => console.log('Play/Pause'),
    onRewind: () => console.log('Rewind'),
    onForward: () => console.log('Forward'),
    onSkipPrevious: () => console.log('Previous'),
    onSkipNext: () => console.log('Next'),
  },
}
