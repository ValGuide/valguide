import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { PlayerProvider } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { StopSearchBar } from './stop-search-bar'

const museumStops: PlayerStop[] = [
  {
    nanoId: 'stop-1',
    title: 'Entrance Hall',
    audioUrl: 'https://example.com/1.mp3',
    coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 150,
  },
  {
    nanoId: 'stop-2',
    title: 'The Starry Night',
    audioUrl: 'https://example.com/2.mp3',
    coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 347,
  },
  {
    nanoId: 'stop-3',
    title: 'Sunflowers',
    audioUrl: 'https://example.com/3.mp3',
    coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 252,
  },
]

const meta = {
  title: 'Player/StopSearchBar',
  component: StopSearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-1">
        <div className="w-80">
          <Story />
        </div>
      </PlayerProvider>
    ),
  ],
} satisfies Meta<typeof StopSearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    showQrButton: false,
  },
}

export const WithQrButton: Story = {
  args: {
    showQrButton: true,
    onQrScanRequest: fn(),
  },
}
