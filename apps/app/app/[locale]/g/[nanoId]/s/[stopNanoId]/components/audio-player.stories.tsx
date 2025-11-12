import type { Meta, StoryObj } from '@storybook/react'
import { AudioPlayer } from './audio-player'

const meta: Meta<typeof AudioPlayer> = {
  title: 'App/Stop/AudioPlayer',
  component: AudioPlayer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AudioPlayer>

export const Default: Story = {
  args: {
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
}
