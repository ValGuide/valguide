import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CoverImage } from './cover-image'

const meta = {
  title: 'Player/CoverImage',
  component: CoverImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CoverImage>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    src: faker.image.url({ width: 800, height: 800 }),
    alt: 'The Starry Night by Vincent van Gogh',
    className: 'w-64',
  },
}

export const NoImage: Story = {
  args: {
    src: null,
    alt: 'Audio track without cover',
    className: 'w-64',
  },
}

export const SmallSize: Story = {
  args: {
    src: faker.image.url({ width: 400, height: 400 }),
    alt: 'Small cover image',
    className: 'w-32',
  },
}

export const LargeSize: Story = {
  args: {
    src: faker.image.url({ width: 800, height: 800 }),
    alt: 'Large cover image',
    className: 'w-96',
  },
}
