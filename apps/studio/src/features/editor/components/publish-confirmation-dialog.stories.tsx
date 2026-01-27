import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { PublishConfirmationDialog } from './publish-confirmation-dialog'

const meta = {
  title: 'Studio/Editor/Dialogs/PublishConfirmationDialog',
  component: PublishConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    isPublishing: false,
    onConfirm: fn(),
  },
} satisfies Meta<typeof PublishConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    isPublishing: false,
  },
}

export const Publishing: Story = {
  args: {
    open: true,
    isPublishing: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
