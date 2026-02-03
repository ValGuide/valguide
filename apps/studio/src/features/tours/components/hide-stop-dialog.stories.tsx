import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { HideStopDialog } from './hide-stop-dialog'

const meta = {
  title: 'Tours/Dialogs/HideStopDialog',
  component: HideStopDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    stopTitle: 'The Mona Lisa',
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }),
  },
} satisfies Meta<typeof HideStopDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    stopTitle: 'The Mona Lisa',
  },
}

export const DifferentStop: Story = {
  args: {
    open: true,
    stopTitle: 'Ancient Egyptian Artifacts',
  },
}

export const LongTitle: Story = {
  args: {
    open: true,
    stopTitle: 'The Grand Hall with its remarkable collection of paintings and sculptures from the Renaissance period',
  },
}

export const Closed: Story = {
  args: {
    open: false,
    stopTitle: 'Victorian Collection',
  },
}
