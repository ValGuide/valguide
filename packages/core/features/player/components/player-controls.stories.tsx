import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { PlayerControls } from './player-controls'

const createMockStops = (count: number): PlayerStop[] =>
  Array.from({ length: count }, (_, i) => ({
    nanoId: `stop-${i + 1}`,
    title: faker.lorem.words(3),
    audioUrl: 'https://example.com/audio.mp3',
    coverImageUrl: faker.image.url({ width: 200, height: 200 }),
    duration: 180 + i * 60,
  }))

const mockStops = createMockStops(5)

function PlayerControlsWithState({ isPlaying }: { isPlaying: boolean }) {
  const store = usePlayerStoreContext()

  useEffect(() => {
    store.setState({ isPlaying })
  }, [store, isPlaying])

  return <PlayerControls />
}

const meta = {
  title: 'Player/PlayerControls',
  component: PlayerControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PlayerControls>

export default meta
type Story = StoryObj<typeof meta>

export const Paused: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-3">
        <PlayerControlsWithState isPlaying={false} />
      </PlayerProvider>
    ),
  ],
}

export const Playing: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-3">
        <PlayerControlsWithState isPlaying={true} />
      </PlayerProvider>
    ),
  ],
}

export const FirstStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-1">
        <PlayerControlsWithState isPlaying={false} />
      </PlayerProvider>
    ),
  ],
}

export const LastStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-5">
        <PlayerControlsWithState isPlaying={false} />
      </PlayerProvider>
    ),
  ],
}

export const SingleStop: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStops[0]]} initialStopNanoId="stop-1">
        <PlayerControlsWithState isPlaying={false} />
      </PlayerProvider>
    ),
  ],
}
