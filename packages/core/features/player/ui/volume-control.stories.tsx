import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themes } from '@valguide/features/themes/types.ts'
import { VolumeControl } from './volume-control'

const meta: Meta<typeof VolumeControl> = {
  title: 'Player/VolumeControl',
  component: VolumeControl,
}

export default meta

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-2 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <span>Default - Low Volume</span>
              <VolumeControl value={20} variant="default" />
            </div>
            <div className="flex flex-col gap-2">
              <span>Default - Medium Volume</span>
              <VolumeControl value={50} variant="default" />
            </div>
            <div className="flex flex-col gap-2">
              <span>Default - High Volume</span>
              <VolumeControl value={80} variant="default" />
            </div>
            <div className="flex flex-col gap-2">
              <span>Default - Muted</span>
              <VolumeControl value={0} variant="default" />
            </div>
            <div className="flex flex-col gap-2">
              <span>Compact</span>
              <VolumeControl value={50} variant="compact" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Default: StoryObj<typeof VolumeControl> = {
  args: {
    value: 50,
    variant: 'default',
  },
}

export const Compact: StoryObj<typeof VolumeControl> = {
  args: {
    value: 50,
    variant: 'compact',
  },
}

export const LowVolume: StoryObj<typeof VolumeControl> = {
  args: {
    value: 20,
    variant: 'default',
  },
}

export const HighVolume: StoryObj<typeof VolumeControl> = {
  args: {
    value: 80,
    variant: 'default',
  },
}

export const Muted: StoryObj<typeof VolumeControl> = {
  args: {
    value: 0,
    variant: 'default',
  },
}

export const Interactive: StoryObj<typeof VolumeControl> = {
  args: {
    value: 50,
    onValueChange: (value) => console.log('Volume changed:', value),
  },
}
