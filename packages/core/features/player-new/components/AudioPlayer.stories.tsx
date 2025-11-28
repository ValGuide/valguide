import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Track } from '../types'
import { AudioPlayer } from './AudioPlayer'

const meta: Meta<typeof AudioPlayer> = {
  title: 'Player New/AudioPlayer',
  component: AudioPlayer,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

const sampleTrack: Track = {
  id: '1',
  title: 'The Starry Night',
  artist: 'Museum of Modern Art',
  artworkUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1200&fit=crop&q=80',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example audio
  duration: 372,
  transcript: [
    { id: '1', startTime: 0, endTime: 10, text: 'Welcome to The Starry Night by Vincent van Gogh.' },
    {
      id: '2',
      startTime: 10,
      endTime: 25,
      text: 'Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence.',
    },
    { id: '3', startTime: 25, endTime: 40, text: 'You can see the swirling sky, which dominates the composition.' },
    {
      id: '4',
      startTime: 40,
      endTime: 60,
      text: 'Notice the cypress tree in the foreground, acting as a dark, flame-like connection between earth and sky.',
    },
  ],
}

export const Default: StoryObj<typeof AudioPlayer> = {
  args: {
    track: sampleTrack,
  },
}

export const WithoutTranscript: StoryObj<typeof AudioPlayer> = {
  args: {
    track: {
      ...sampleTrack,
      transcript: undefined,
    },
  },
}
