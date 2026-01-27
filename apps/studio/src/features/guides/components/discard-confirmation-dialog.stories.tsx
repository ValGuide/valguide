import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DiscardConfirmationDialog } from './discard-confirmation-dialog'

const meta = {
  title: 'Guides/Dialogs/DiscardConfirmationDialog',
  component: DiscardConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof DiscardConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
