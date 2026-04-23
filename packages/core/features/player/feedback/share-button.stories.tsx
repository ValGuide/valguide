import type { Meta, StoryObj } from '@storybook/react'
import { ShareButton } from './share-button'

const meta = {
  title: 'Player/Feedback/ShareButton',
  component: ShareButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    url: 'https://app.valguide.com/museum-zurich/giacometti',
    title: 'Van Gogh Museum Audio Guide',
    text: 'Check out this amazing museum guide!',
  },
} satisfies Meta<typeof ShareButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
