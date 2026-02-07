import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DiscardConfirmationDialog } from './discard-confirmation-dialog'

const meta = {
  title: 'Studio/Editor/Dialogs/DiscardConfirmationDialog',
  component: DiscardConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
    contentType: 'tour',
  },
} satisfies Meta<typeof DiscardConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
  },
}

export const StopContext: Story = {
  args: {
    contentType: 'stop',
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
