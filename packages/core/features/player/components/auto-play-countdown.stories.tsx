import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { AutoPlayCountdown } from './auto-play-countdown'

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

function AutoPlayCountdownWithState({ hasEnded }: { hasEnded: boolean }) {
  const store = usePlayerStoreContext()

  React.useEffect(() => {
    store.setState({ hasEnded })
  }, [store, hasEnded])

  return <AutoPlayCountdown />
}

const meta = {
  title: 'Player/AutoPlayCountdown',
  component: AutoPlayCountdown,
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
} satisfies Meta<typeof AutoPlayCountdown>

export default meta
type Story = StoryObj<typeof meta>

export const CountingDown: Story = {
  render: () => (
    <PlayerProvider stops={museumStops} initialStopNanoId="stop-1">
      <AutoPlayCountdownWithState hasEnded={true} />
    </PlayerProvider>
  ),
}

export const Hidden: Story = {
  render: () => (
    <PlayerProvider stops={museumStops} initialStopNanoId="stop-1">
      <AutoPlayCountdownWithState hasEnded={false} />
    </PlayerProvider>
  ),
}

export const LastStop: Story = {
  render: () => (
    <PlayerProvider stops={museumStops} initialStopNanoId="stop-3">
      <AutoPlayCountdownWithState hasEnded={true} />
    </PlayerProvider>
  ),
}
