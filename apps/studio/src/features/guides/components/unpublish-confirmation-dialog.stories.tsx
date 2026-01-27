import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { UnpublishConfirmationDialog } from './unpublish-confirmation-dialog'

const meta = {
  title: 'Guides/Dialogs/UnpublishConfirmationDialog',
  component: UnpublishConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    contentType: 'guide',
    onConfirm: fn(),
  },
} satisfies Meta<typeof UnpublishConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const GuideDefault: Story = {
  args: {
    open: true,
    contentType: 'guide',
  },
}

export const StopDefault: Story = {
  args: {
    open: true,
    contentType: 'stop',
  },
}

export const GuideClosed: Story = {
  args: {
    open: false,
    contentType: 'guide',
  },
}

export const StopClosed: Story = {
  args: {
    open: false,
    contentType: 'stop',
  },
}
