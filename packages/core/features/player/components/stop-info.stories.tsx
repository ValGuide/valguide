import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import { PlayerProvider } from '../store/player-provider'
import type { PlayerStop } from '../types'
import { StopInfo } from './stop-info'

const createMockStops = (count: number): PlayerStop[] =>
  Array.from({ length: count }, (_, i) => ({
    nanoId: `stop-${i + 1}`,
    title: faker.lorem.words(3),
    audioUrl: 'https://example.com/audio.mp3',
    coverImageUrl: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'art' }),
    duration: 180 + i * 60,
  }))

const mockStops = createMockStops(5)
mockStops[0].title = 'The Starry Night'

const meta = {
  title: 'Visitor App/Player/StopInfo',
  component: StopInfo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-1">
        <div className="w-80">
          <Story />
        </div>
      </PlayerProvider>
    ),
  ],
} satisfies Meta<typeof StopInfo>

export default meta
type Story = StoryObj<typeof meta>

export const FirstStop: Story = {}

export const MiddleStop: Story = {
  decorators: [
    (Story) => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-3">
        <div className="w-80">
          <Story />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const LastStop: Story = {
  decorators: [
    (Story) => (
      <PlayerProvider stops={mockStops} initialStopNanoId="stop-5">
        <div className="w-80">
          <Story />
        </div>
      </PlayerProvider>
    ),
  ],
}

export const SingleStop: Story = {
  decorators: [
    (Story) => (
      <PlayerProvider stops={[mockStops[0]]} initialStopNanoId="stop-1">
        <div className="w-80">
          <Story />
        </div>
      </PlayerProvider>
    ),
  ],
}
