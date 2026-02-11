import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { SpeedSelector } from './speed-selector'

const mockStop: PlayerStop = {
  nanoId: 'stop-1',
  title: 'The Starry Night',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 347,
}

function SpeedSelectorWithState({ speed }: { speed: number }) {
  const store = usePlayerStoreContext()

  useEffect(() => {
    store.setState({ speed })
  }, [store, speed])

  return <SpeedSelector />
}

const meta = {
  title: 'Player/SpeedSelector',
  component: SpeedSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SpeedSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <SpeedSelectorWithState speed={1} />
      </PlayerProvider>
    ),
  ],
}

export const SlowSpeed: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <SpeedSelectorWithState speed={0.75} />
      </PlayerProvider>
    ),
  ],
}

export const FastSpeed: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <SpeedSelectorWithState speed={1.5} />
      </PlayerProvider>
    ),
  ],
}

export const DoubleSpeed: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <SpeedSelectorWithState speed={2} />
      </PlayerProvider>
    ),
  ],
}
