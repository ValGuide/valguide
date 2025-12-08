import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { RadiusSelector } from './radius-selector'

const meta: Meta<typeof RadiusSelector> = {
  title: 'Studio/Design/RadiusSelector',
  component: RadiusSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RadiusSelector>

function RadiusSelectorWithState({ initialValue = 0.5 }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue)
  return (
    <div className="w-80">
      <RadiusSelector value={value} onValueChange={setValue} />
    </div>
  )
}

export const Default: Story = {
  render: () => <RadiusSelectorWithState />,
}

export const Square: Story = {
  render: () => <RadiusSelectorWithState initialValue={0} />,
}

export const Rounded: Story = {
  render: () => <RadiusSelectorWithState initialValue={1.5} />,
}

export const VeryRounded: Story = {
  render: () => <RadiusSelectorWithState initialValue={2} />,
}
