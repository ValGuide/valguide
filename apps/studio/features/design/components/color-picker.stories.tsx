import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { ColorPicker } from './color-picker'

const meta: Meta<typeof ColorPicker> = {
  title: 'Studio/Design/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ColorPicker>

function ColorPickerWithState({
  label = 'Primary',
  initialValue = '#3b82f6',
}: {
  label?: string
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <div className="w-48">
      <ColorPicker label={label} value={value} onChange={setValue} />
    </div>
  )
}

export const Default: Story = {
  render: () => <ColorPickerWithState />,
}

export const DarkColor: Story = {
  render: () => <ColorPickerWithState label="Background" initialValue="#0a0a0a" />,
}

export const LightColor: Story = {
  render: () => <ColorPickerWithState label="Foreground" initialValue="#fafafa" />,
}

export const AccentColor: Story = {
  render: () => <ColorPickerWithState label="Accent" initialValue="#9333ea" />,
}
