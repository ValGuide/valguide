import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themes } from '@valguide/ui/theme/themes'
import { PlayButton } from './play-button'

const meta: Meta<typeof PlayButton> = {
  title: 'Player/PlayButton',
  component: PlayButton,
}

export default meta

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-2 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <span>Default - Not Playing</span>
              <PlayButton variant="default" isPlaying={false} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Default - Playing</span>
              <PlayButton variant="default" isPlaying={true} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Secondary - Not Playing</span>
              <PlayButton variant="secondary" isPlaying={false} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Secondary - Playing</span>
              <PlayButton variant="secondary" isPlaying={true} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Ghost - Not Playing</span>
              <PlayButton variant="ghost" isPlaying={false} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Ghost - Playing</span>
              <PlayButton variant="ghost" isPlaying={true} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex flex-col items-center gap-2">
              <span>Small</span>
              <PlayButton size="sm" isPlaying={false} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Default</span>
              <PlayButton size="default" isPlaying={false} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span>Large</span>
              <PlayButton size="lg" isPlaying={false} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Default: StoryObj<typeof PlayButton> = {
  args: {
    isPlaying: false,
    variant: 'default',
  },
}

export const Playing: StoryObj<typeof PlayButton> = {
  args: {
    isPlaying: true,
    variant: 'default',
  },
}

export const Secondary: StoryObj<typeof PlayButton> = {
  args: {
    isPlaying: false,
    variant: 'secondary',
  },
}

export const Ghost: StoryObj<typeof PlayButton> = {
  args: {
    isPlaying: false,
    variant: 'ghost',
  },
}

export const Small: StoryObj<typeof PlayButton> = {
  args: {
    isPlaying: false,
    size: 'sm',
  },
}

export const Large: StoryObj<typeof PlayButton> = {
  args: {
    isPlaying: false,
    size: 'lg',
  },
}
