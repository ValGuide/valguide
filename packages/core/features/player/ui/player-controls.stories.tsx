import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themes } from '@valguide/features/themes/types.ts'
import { PlayerControls } from './player-controls'

const meta: Meta<typeof PlayerControls> = {
  title: 'Player/PlayerControls',
  component: PlayerControls,
}

export default meta

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-2 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col gap-2">
              <span>Default - Not Playing</span>
              <PlayerControls isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>Default - Playing</span>
              <PlayerControls isPlaying={true} />
            </div>
            <div className="flex flex-col gap-2">
              <span>Compact</span>
              <PlayerControls variant="compact" isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>Small</span>
              <PlayerControls size="sm" isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>Large</span>
              <PlayerControls size="lg" isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>Shuffle Active</span>
              <PlayerControls shuffleActive={true} isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>Repeat Active</span>
              <PlayerControls repeatActive={true} isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>No Skip Controls</span>
              <PlayerControls showSkipControls={false} isPlaying={false} />
            </div>
            <div className="flex flex-col gap-2">
              <span>No Shuffle/Repeat</span>
              <PlayerControls showShuffleButton={false} showRepeatButton={false} isPlaying={false} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Default: StoryObj<typeof PlayerControls> = {
  args: {
    isPlaying: false,
  },
}

export const Playing: StoryObj<typeof PlayerControls> = {
  args: {
    isPlaying: true,
  },
}

export const Compact: StoryObj<typeof PlayerControls> = {
  args: {
    variant: 'compact',
    isPlaying: false,
  },
}

export const Small: StoryObj<typeof PlayerControls> = {
  args: {
    size: 'sm',
    isPlaying: false,
  },
}

export const Large: StoryObj<typeof PlayerControls> = {
  args: {
    size: 'lg',
    isPlaying: false,
  },
}

export const ShuffleActive: StoryObj<typeof PlayerControls> = {
  args: {
    shuffleActive: true,
    isPlaying: false,
  },
}

export const RepeatActive: StoryObj<typeof PlayerControls> = {
  args: {
    repeatActive: true,
    isPlaying: false,
  },
}

export const NoSkipControls: StoryObj<typeof PlayerControls> = {
  args: {
    showSkipControls: false,
    isPlaying: false,
  },
}

export const NoShuffleRepeat: StoryObj<typeof PlayerControls> = {
  args: {
    showShuffleButton: false,
    showRepeatButton: false,
    isPlaying: false,
  },
}

export const Interactive: StoryObj<typeof PlayerControls> = {
  args: {
    isPlaying: false,
    onPlayPause: () => console.log('Play/Pause clicked'),
    onSkipNext: () => console.log('Skip Next clicked'),
    onSkipPrevious: () => console.log('Skip Previous clicked'),
    onToggleShuffle: () => console.log('Toggle Shuffle clicked'),
    onToggleRepeat: () => console.log('Toggle Repeat clicked'),
  },
}
