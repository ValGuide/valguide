import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { StarRating } from './star-rating'

const meta = {
  title: 'Visitor App/Player/Feedback/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 0,
    onChange: fn(),
  },
} satisfies Meta<typeof StarRating>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    value: 0,
  },
}

export const ThreeStars: Story = {
  args: {
    value: 3,
  },
}

export const FiveStars: Story = {
  args: {
    value: 5,
  },
}

export const Small: Story = {
  args: {
    value: 4,
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    value: 4,
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    value: 3,
    disabled: true,
  },
}

function InteractiveStarRating() {
  const [value, setValue] = useState(0)
  return (
    <div className="flex flex-col items-center gap-4">
      <StarRating value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">Selected: {value} stars</p>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveStarRating />,
}
