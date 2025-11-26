import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PlayerControls } from './PlayerControls'

const meta: Meta<typeof PlayerControls> = {
  title: 'Player New/PlayerControls',
  component: PlayerControls,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-8 w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Paused: StoryObj<typeof PlayerControls> = {
  args: {
    isPlaying: false,
    onPlayPause: () => console.log('Play/Pause clicked'),
    onRewind: () => console.log('Rewind clicked'),
    onForward: () => console.log('Forward clicked'),
  },
}

export const Playing: StoryObj<typeof PlayerControls> = {
  args: {
    isPlaying: true,
    onPlayPause: () => console.log('Play/Pause clicked'),
    onRewind: () => console.log('Rewind clicked'),
    onForward: () => console.log('Forward clicked'),
  },
}
