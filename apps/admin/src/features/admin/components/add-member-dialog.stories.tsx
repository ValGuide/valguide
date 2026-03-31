import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { AddMemberDialog } from './add-member-dialog'

const meta = {
  title: 'Admin/Dialogs/AddMemberDialog',
  component: AddMemberDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    isAdding: false,
    onConfirm: fn(),
  },
} satisfies Meta<typeof AddMemberDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
