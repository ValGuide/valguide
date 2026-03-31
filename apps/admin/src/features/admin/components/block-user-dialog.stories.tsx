import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { BlockUserDialog } from './block-user-dialog'

const meta = {
  title: 'Admin/Dialogs/BlockUserDialog',
  component: BlockUserDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    userEmail: 'visitor@example.com',
    isBlocking: false,
    onConfirm: fn(),
  },
} satisfies Meta<typeof BlockUserDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
