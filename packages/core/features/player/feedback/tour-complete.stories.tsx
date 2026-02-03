import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TourComplete } from './tour-complete'

const meta = {
  title: 'Player/Feedback/TourComplete',
  component: TourComplete,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    guideTitle: 'Van Gogh Museum Audio Guide',
    shareUrl: 'https://app.valguide.com/g/abc123',
    onFeedbackSubmit: fn(),
  },
} satisfies Meta<typeof TourComplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomThankYou: Story = {
  args: {
    thankYou: {
      title: 'Thanks for visiting!',
      buttonLabel: 'Visit our shop',
      buttonUrl: 'https://shop.example.com',
    },
  },
}

export const WithoutFeedback: Story = {
  args: {
    onFeedbackSubmit: undefined,
    thankYou: {
      buttonLabel: 'Learn more about Van Gogh',
      buttonUrl: 'https://vangoghmuseum.nl',
    },
  },
}
