import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DiffToggle } from './diff-toggle'

const meta: Meta<typeof DiffToggle> = {
  title: 'Editor/DiffToggle',
  component: DiffToggle,
  parameters: {
    layout: 'centered',
  },
  args: {
    onToggle: fn(),
  },
}

export default meta
type Story = StoryObj<typeof DiffToggle>

export const Inactive: Story = {
  args: {
    enabled: false,
    changedCount: 3,
  },
}

export const Active: Story = {
  args: {
    enabled: true,
    changedCount: 3,
  },
}

export const SingleChange: Story = {
  args: {
    enabled: false,
    changedCount: 1,
  },
}

export const NoChanges: Story = {
  args: {
    enabled: false,
    changedCount: 0,
  },
}

export const Disabled: Story = {
  args: {
    enabled: false,
    changedCount: 2,
    disabled: true,
  },
}
