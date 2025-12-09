import type { Meta, StoryObj } from '@storybook/react'
import { ExhibitImage } from './ExhibitImage'

const meta: Meta<typeof ExhibitImage> = {
  title: 'Player New 2/ExhibitImage',
  component: ExhibitImage,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ExhibitImage>

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=400&fit=crop',
    alt: 'Whale shark in blue water',
  },
}

export const Placeholder: Story = {
  args: {
    src: 'https://placehold.co/400x400/0066cc/ffffff?text=Exhibit',
    alt: 'Exhibit placeholder',
  },
}
