import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { AddApprovedDomainDialog } from './add-approved-domain-dialog'

const meta = {
  title: 'Admin/Dialogs/AddApprovedDomainDialog',
  component: AddApprovedDomainDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    isAdding: false,
    onConfirm: fn(),
  },
} satisfies Meta<typeof AddApprovedDomainDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
