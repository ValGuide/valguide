import type { Meta, StoryObj } from '@storybook/react'
import { AudioPlayer } from './AudioPlayer'

const meta: Meta<typeof AudioPlayer> = {
  title: 'Player New 2/AudioPlayer',
  component: AudioPlayer,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export default meta
type Story = StoryObj<typeof AudioPlayer>

const sampleTrack = {
  id: '1',
  title: '01. The Great White',
  artist: 'Steinhart Aquarium',
  artworkUrl: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=400&fit=crop',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  duration: 180,
}

export const Default: Story = {
  args: {
    track: sampleTrack,
    onClose: () => console.log('Close pressed'),
    onSkipPrevious: () => console.log('Previous pressed'),
    onSkipNext: () => console.log('Next pressed'),
  },
}

export const Mobile: Story = {
  args: {
    track: sampleTrack,
    onClose: () => console.log('Close pressed'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const MobileLarge: Story = {
  args: {
    track: sampleTrack,
    onClose: () => console.log('Close pressed'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
}

export const Tablet: Story = {
  args: {
    track: sampleTrack,
    onClose: () => console.log('Close pressed'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const LongTitle: Story = {
  args: {
    track: {
      id: '2',
      title: '15. The Amazing Journey of Pacific Ocean Giants and Their Migration Patterns',
      artist: 'California Academy of Sciences',
      artworkUrl: 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&h=400&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 320,
    },
    onClose: () => console.log('Close pressed'),
  },
}

export const NoArtist: Story = {
  args: {
    track: {
      id: '3',
      title: '03. Coral Reef Ecosystem',
      artworkUrl: 'https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=400&h=400&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 240,
    },
    onClose: () => console.log('Close pressed'),
  },
}
