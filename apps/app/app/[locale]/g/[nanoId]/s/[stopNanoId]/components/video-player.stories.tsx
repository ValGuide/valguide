import type { Meta, StoryObj } from '@storybook/react'
import { VideoPlayer } from './video-player'

const meta: Meta<typeof VideoPlayer> = {
  title: 'App/Stop/VideoPlayer',
  component: VideoPlayer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof VideoPlayer>

export const Default: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
}
