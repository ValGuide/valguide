import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import type { PlayerStop } from '../types'
import { StopsListItem } from './stops-list-item'

const mockStop: PlayerStop = {
  nanoId: 'stop-001',
  title: 'The Starry Night',
  audioUrl: 'https://example.com/audio.mp3',
  coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
  duration: 347,
}

const mockStopNoCover: PlayerStop = {
  nanoId: 'stop-002',
  title: 'Sunflowers',
  audioUrl: 'https://example.com/audio2.mp3',
  coverImageUrl: null,
  duration: 252,
}

const meta = {
  title: 'Player/StopsListItem',
  component: StopsListItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StopsListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stop: mockStop,
    index: 0,
    isPlaying: false,
    isCurrent: false,
  },
}

export const CurrentNotPlaying: Story = {
  args: {
    stop: mockStop,
    index: 2,
    isPlaying: false,
    isCurrent: true,
  },
}

export const CurrentPlaying: Story = {
  args: {
    stop: mockStop,
    index: 2,
    isPlaying: true,
    isCurrent: true,
  },
}

export const NoCoverImage: Story = {
  args: {
    stop: mockStopNoCover,
    index: 1,
    isPlaying: false,
    isCurrent: false,
  },
}

export const LongTitle: Story = {
  args: {
    stop: {
      ...mockStop,
      title: 'The Persistence of Memory - A Masterpiece by Salvador Dalí from 1931',
    },
    index: 4,
    isPlaying: false,
    isCurrent: false,
  },
}

export const NoDuration: Story = {
  args: {
    stop: {
      ...mockStop,
      duration: undefined,
    },
    index: 0,
    isPlaying: false,
    isCurrent: false,
  },
}
