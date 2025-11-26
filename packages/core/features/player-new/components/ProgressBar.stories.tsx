import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Player New/ProgressBar',
  component: ProgressBar,
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

export const Start: StoryObj<typeof ProgressBar> = {
  args: {
    currentTime: 0,
    duration: 300,
    onSeek: (time) => console.log('Seek to', time),
  },
}

export const Middle: StoryObj<typeof ProgressBar> = {
  args: {
    currentTime: 150,
    duration: 300,
    onSeek: (time) => console.log('Seek to', time),
  },
}

export const End: StoryObj<typeof ProgressBar> = {
  args: {
    currentTime: 300,
    duration: 300,
    onSeek: (time) => console.log('Seek to', time),
  },
}
