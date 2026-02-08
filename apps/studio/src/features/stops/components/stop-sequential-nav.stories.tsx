import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { StopSequentialNav } from './stop-sequential-nav'

const meta = {
  title: 'Studio/Pages/Stops/Edit/StopSequentialNav',
  component: StopSequentialNav,
  args: {
    onNavigate: fn(),
  },
} satisfies Meta<typeof StopSequentialNav>

export default meta
type Story = StoryObj<typeof meta>

export const MiddleStop: Story = {
  args: {
    prevStop: { nanoId: 'stop1abc', title: 'The Starry Night', position: 0 },
    nextStop: { nanoId: 'stop3abc', title: 'Water Lilies', position: 2 },
  },
}

export const FirstStop: Story = {
  args: {
    nextStop: { nanoId: 'stop2abc', title: 'Mona Lisa', position: 1 },
  },
}

export const LastStop: Story = {
  args: {
    prevStop: { nanoId: 'stop2abc', title: 'Mona Lisa', position: 1 },
  },
}
