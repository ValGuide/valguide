import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { FullPlayer } from './full-player'

const museumStops: PlayerStop[] = [
  {
    nanoId: 'stop-1',
    title: 'Entrance Hall',
    audioUrl: 'https://example.com/1.mp3',
    coverImageUrl: faker.image.url({ width: 800, height: 800 }),
    duration: 150,
  },
  {
    nanoId: 'stop-2',
    title: 'The Starry Night',
    audioUrl: 'https://example.com/2.mp3',
    coverImageUrl: faker.image.url({ width: 800, height: 800 }),
    duration: 347,
  },
  {
    nanoId: 'stop-3',
    title: 'Sunflowers',
    audioUrl: 'https://example.com/3.mp3',
    coverImageUrl: faker.image.url({ width: 800, height: 800 }),
    duration: 252,
  },
  {
    nanoId: 'stop-4',
    title: 'Café Terrace at Night',
    audioUrl: 'https://example.com/4.mp3',
    coverImageUrl: faker.image.url({ width: 800, height: 800 }),
    duration: 235,
  },
  {
    nanoId: 'stop-5',
    title: 'Irises',
    audioUrl: 'https://example.com/5.mp3',
    coverImageUrl: faker.image.url({ width: 800, height: 800 }),
    duration: 189,
  },
]

function FullPlayerWithState({
  isPlaying,
  currentTime,
  duration,
  speed,
}: {
  isPlaying: boolean
  currentTime: number
  duration: number
  speed: number
}) {
  const store = usePlayerStoreContext()

  useEffect(() => {
    store.setState({ isPlaying, currentTime, duration, speed })
  }, [store, isPlaying, currentTime, duration, speed])

  return <FullPlayer />
}

const meta = {
  title: 'Player/FullPlayer',
  component: FullPlayer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FullPlayer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={false} currentTime={0} duration={347} speed={1} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const Playing: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={true} currentTime={154} duration={347} speed={1} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const Midway: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-3">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={true} currentTime={126} duration={252} speed={1} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const FastSpeed: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-2">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={true} currentTime={100} duration={347} speed={1.5} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const FirstStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-1">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={false} currentTime={0} duration={150} speed={1} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const LastStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={museumStops} initialStopNanoId="stop-5">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={false} currentTime={180} duration={189} speed={1} />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const NoCoverImage: Story = {
  decorators: [
    () => {
      const stopsNoCover = [{ ...museumStops[0], coverImageUrl: null }, ...museumStops.slice(1)]
      return (
        <PlayerProvider stops={stopsNoCover} initialStopNanoId="stop-1">
          <div className="w-full max-w-md p-4">
            <FullPlayerWithState isPlaying={false} currentTime={0} duration={150} speed={1} />
          </div>
        </PlayerProvider>
      )
    },
  ],
}

export const SingleStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[museumStops[0]]} initialStopNanoId="stop-1">
        <div className="w-full max-w-md p-4">
          <FullPlayerWithState isPlaying={false} currentTime={0} duration={150} speed={1} />
        </div>
      </PlayerProvider>
    ),
  ],
}
