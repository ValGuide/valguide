import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressBar } from './progress-bar'


import {themes} from "@valguide/features/themes/types.ts";

const meta: Meta<typeof ProgressBar> = {
  title: 'Player/ProgressBar',
  component: ProgressBar,
}

export default meta

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-2 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2 w-64">
              <span>Default</span>
              <ProgressBar value={[30]} max={100} variant="default" />
            </div>
            <div className="flex flex-col gap-2 w-64">
              <span>Compact</span>
              <ProgressBar value={[50]} max={100} variant="compact" />
            </div>
            <div className="flex flex-col gap-2 w-64">
              <span>With Time Display</span>
              <ProgressBar value={[75]} max={100} currentTime="1:45" duration="3:30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Default: StoryObj<typeof ProgressBar> = {
  args: {
    value: [30],
    max: 100,
    variant: 'default',
  },
}

export const Compact: StoryObj<typeof ProgressBar> = {
  args: {
    value: [50],
    max: 100,
    variant: 'compact',
  },
}

export const WithTimeDisplay: StoryObj<typeof ProgressBar> = {
  args: {
    value: [75],
    max: 100,
    currentTime: '1:45',
    duration: '3:30',
  },
}

export const Interactive: StoryObj<typeof ProgressBar> = {
  args: {
    value: [50],
    max: 100,
    currentTime: '2:30',
    duration: '5:00',
    onValueChange: (value) => console.log('Value changed:', value),
  },
}

export const ZeroProgress: StoryObj<typeof ProgressBar> = {
  args: {
    value: [0],
    max: 100,
    currentTime: '0:00',
    duration: '3:45',
  },
}

export const FullProgress: StoryObj<typeof ProgressBar> = {
  args: {
    value: [100],
    max: 100,
    currentTime: '3:45',
    duration: '3:45',
  },
}
