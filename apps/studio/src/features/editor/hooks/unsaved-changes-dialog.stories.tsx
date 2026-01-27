import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { UnsavedChangesDialog } from './unsaved-changes-dialog'

const meta = {
  title: 'Studio/Editor/Dialogs/UnsavedChangesDialog',
  component: UnsavedChangesDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    onStay: fn(),
    onLeave: fn(),
  },
} satisfies Meta<typeof UnsavedChangesDialog>

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
