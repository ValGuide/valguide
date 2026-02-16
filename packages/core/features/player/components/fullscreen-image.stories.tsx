import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { FullscreenImage } from './fullscreen-image'
import { faker } from '@faker-js/faker'

const meta = {
  title: 'Player/FullscreenImage',
  component: FullscreenImage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    src: faker.image.urlLoremFlickr({ width: 800, height: 450, category: 'art' }),
    alt: 'The Starry Night by Vincent van Gogh',
    open: true,
    onOpenChange: fn(),
  },
} satisfies Meta<typeof FullscreenImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
