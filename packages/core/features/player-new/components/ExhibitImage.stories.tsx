import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ExhibitImage } from './ExhibitImage'

const meta: Meta<typeof ExhibitImage> = {
  title: 'Player New/ExhibitImage',
  component: ExhibitImage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

export const Default: StoryObj<typeof ExhibitImage> = {
  args: {
    src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1200&fit=crop&q=80',
    alt: 'The Starry Night',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-black">
        <Story />
      </div>
    ),
  ],
}

export const Landscape: StoryObj<typeof ExhibitImage> = {
  args: {
    src: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&h=800&fit=crop&q=80',
    alt: 'Landscape Painting',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-black">
        <Story />
      </div>
    ),
  ],
}
