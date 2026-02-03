import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'
import { fn } from 'storybook/test'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { MiniPlayer } from './mini-player'

const museumStops: PlayerStop[] = [
  {
    nanoId: 'stop-1',
    title: 'Entrance Hall',
    audioUrl: 'https://example.com/1.mp3',
    coverImageUrl: faker.image.url({ width: 200, height: 200 }),
    duration: 150,
  },
  {
    nanoId: 'stop-2',
    title: 'The Starry Night',
    audioUrl: 'https://example.com/2.mp3',
    coverImageUrl: faker.image.url({ width: 200, height: 200 }),
    duration: 347,
  },
  {
    nanoId: 'stop-3',
    title: 'Sunflowers',
    audioUrl: 'https://example.com/3.mp3',
    coverImageUrl: faker.image.url({ width: 200, height: 200 }),
    duration: 252,
  },
]

function MiniPlayerWithState({
  isPlaying,
  currentTime,
  duration,
}: {
  isPlaying: boolean
  currentTime: number
  duration: number
}) {
  const store = usePlayerStoreContext()

  useEffect(() => {
    store.setState({ isPlaying, currentTime, duration })
  }, [store, isPlaying, currentTime, duration])

  return <MiniPlayer onExpand={fn()} />
}

const meta = {
  title: 'Player/MiniPlayer',
  component: MiniPlayer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onExpand: fn(),
  },
} satisfies Meta<typeof MiniPlayer>

export default meta
type Story = StoryObj<typeof meta>

export const Paused: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="fixed bottom-0 left-0 right-0">
          <MiniPlayerWithState isPlaying={false} currentTime={60} duration={347} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const Playing: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="fixed bottom-0 left-0 right-0">
          <MiniPlayerWithState isPlaying={true} currentTime={154} duration={347} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const AtStart: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-1">
        <div className="fixed bottom-0 left-0 right-0">
          <MiniPlayerWithState isPlaying={false} currentTime={0} duration={150} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const NearEnd: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="fixed bottom-0 left-0 right-0">
          <MiniPlayerWithState isPlaying={true} currentTime={320} duration={347} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const LastStopNoNext: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-3">
        <div className="fixed bottom-0 left-0 right-0">
          <MiniPlayerWithState isPlaying={false} currentTime={100} duration={252} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const LongTitle: Story = {
  decorators: [
    () => {
      const stopsWithLongTitle = [
        { ...museumStops[0], title: 'The Persistence of Memory - A Masterpiece by Salvador Dalí' },
        ...museumStops.slice(1),
      ]
      return (
        <PlayerProvider stops={stopsWithLongTitle} initialStopNanoId="stop-1">
          <div className="fixed bottom-0 left-0 right-0">
            <MiniPlayerWithState isPlaying={true} currentTime={50} duration={150} />
          </div>
        </PlayerProvider>
      )
    },
  ],
}

export const NoCoverImage: Story = {
  decorators: [
    () => {
      const stopsNoCover = [{ ...museumStops[0], coverImageUrl: null }, ...museumStops.slice(1)]
      return (
        <PlayerProvider stops={stopsNoCover} initialStopNanoId="stop-1">
          <div className="fixed bottom-0 left-0 right-0">
            <MiniPlayerWithState isPlaying={false} currentTime={30} duration={150} />
          </div>
        </PlayerProvider>
      )
    },
  ],
}
