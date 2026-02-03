import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RemoveStopDialog } from './remove-stop-dialog'

const meta = {
  title: 'Tours/Dialogs/RemoveStopDialog',
  component: RemoveStopDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    stopTitle: 'The Mona Lisa',
    onConfirm: fn(),
  },
} satisfies Meta<typeof RemoveStopDialog>

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
    stopTitle:
      'The Grand Hall of the Palace with its remarkable collection of historical artifacts and sculptures from the Renaissance period',
  },
}

export const Closed: Story = {
  args: {
    open: false,
    stopTitle: 'Victorian Era Collection',
  },
}
