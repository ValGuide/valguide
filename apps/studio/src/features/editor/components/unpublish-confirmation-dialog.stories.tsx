import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { UnpublishConfirmationDialog } from './unpublish-confirmation-dialog'

const meta = {
  title: 'Studio/Editor/Dialogs/UnpublishConfirmationDialog',
  component: UnpublishConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    languageName: 'English',
    contentType: 'tour',
    onConfirm: fn(),
  },
} satisfies Meta<typeof UnpublishConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const TourDefault: Story = {
  args: {
    open: true,
    contentType: 'tour',
  },
}

export const StopDefault: Story = {
  args: {
    open: true,
    contentType: 'stop',
  },
}

export const TourClosed: Story = {
  args: {
    open: false,
    contentType: 'tour',
  },
}

export const StopClosed: Story = {
  args: {
    open: false,
    contentType: 'stop',
  },
}
