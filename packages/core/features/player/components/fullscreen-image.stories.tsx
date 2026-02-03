import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { FullscreenImage } from './fullscreen-image'

const meta = {
  title: 'Player/FullscreenImage',
  component: FullscreenImage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200',
    alt: 'The Starry Night by Vincent van Gogh',
    open: true,
    onOpenChange: fn(),
  },
} satisfies Meta<typeof FullscreenImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
