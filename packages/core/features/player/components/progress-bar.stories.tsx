import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { PlayerProvider, usePlayerStoreContext } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { ProgressBar } from './progress-bar'

const mockStop: PlayerStop = {
  nanoId: 'stop-1',
  title: 'The Starry Night',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 347,
}

function ProgressBarWithState({ currentTime, duration }: { currentTime: number; duration: number }) {
  const store = usePlayerStoreContext()

  useEffect(() => {
    store.setState({ currentTime, duration })
  }, [store, currentTime, duration])

  return <ProgressBar className="w-full" />
}

const meta = {
  title: 'Player/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const AtStart: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <ProgressBarWithState currentTime={0} duration={347} />
      </PlayerProvider>
    ),
  ],
}

export const Midway: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <ProgressBarWithState currentTime={154} duration={347} />
      </PlayerProvider>
    ),
  ],
}

export const NearEnd: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <ProgressBarWithState currentTime={320} duration={347} />
      </PlayerProvider>
    ),
  ],
}

export const Completed: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[mockStop]} initialStopNanoId="stop-1">
        <ProgressBarWithState currentTime={347} duration={347} />
      </PlayerProvider>
    ),
  ],
}

export const LongDuration: Story = {
  decorators: [
    () => (
      <PlayerProvider stops={[{ ...mockStop, duration: 3600 }]} initialStopNanoId="stop-1">
        <ProgressBarWithState currentTime={1800} duration={3600} />
      </PlayerProvider>
    ),
  ],
}
