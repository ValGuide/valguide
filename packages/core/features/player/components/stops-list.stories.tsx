import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { StopsList } from './stops-list'

const createMockStops = (count: number): PlayerStop[] =>
  Array.from({ length: count }, (_, i) => ({
    nanoId: `stop-${i + 1}`,
    title: faker.lorem.words({ min: 2, max: 5 }),
    audioUrl: 'https://example.com/audio.mp3',
    coverImageUrl: i % 3 === 0 ? null : faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 120 + i * 45,
  }))

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
  {
    nanoId: 'stop-4',
    title: 'Café Terrace at Night',
    audioUrl: 'https://example.com/4.mp3',
    coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 235,
  },
  {
    nanoId: 'stop-5',
    title: 'Irises',
    audioUrl: 'https://example.com/5.mp3',
    coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 189,
  },
]

function StopsListWithState({ isPlaying }: { isPlaying: boolean }) {
  const store = usePlayerStoreContext()

  useEffect(() => {
    store.setState({ isPlaying })
  }, [store, isPlaying])

  return <StopsList />
}

const meta = {
  title: 'Player/StopsList',
  component: StopsList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StopsList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="w-96">
          <StopsListWithState isPlaying={false} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const CurrentlyPlaying: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="w-96">
          <StopsListWithState isPlaying={true} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const FirstStopSelected: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-1">
        <div className="w-96">
          <StopsListWithState isPlaying={false} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const LastStopSelected: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-5">
        <div className="w-96">
          <StopsListWithState isPlaying={true} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const ManyStops: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={createMockStops(12)} initialStopNanoId="stop-5">
        <div className="w-96 max-h-96 overflow-auto">
          <StopsListWithState isPlaying={false} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const SingleStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[museumStops[0]]} initialStopNanoId="stop-1">
        <div className="w-96">
          <StopsListWithState isPlaying={false} />
        </div>
      </PlayerProvider>
    ),
  ],
}
