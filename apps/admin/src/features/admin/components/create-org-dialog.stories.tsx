import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { CreateOrgDialog } from './create-org-dialog'

const meta = {
  title: 'Admin/Dialogs/CreateOrgDialog',
  component: CreateOrgDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    isCreating: false,
    onConfirm: fn(),
  },
} satisfies Meta<typeof CreateOrgDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
