import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemePicker } from './theme-picker'

const meta: Meta<typeof ThemePicker> = {
  title: 'Common/ThemePicker',
  component: ThemePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemePicker>

export const Default: Story = {}

export const AlignStart: Story = {
  args: {
    align: 'start',
  },
}

export const AlignEnd: Story = {
  args: {
    align: 'end',
  },
}

export const SideTop: Story = {
  args: {
    side: 'top',
  },
}

export const WithClassName: Story = {
  args: {
    className: 'border border-primary p-4 rounded-md',
  },
}
