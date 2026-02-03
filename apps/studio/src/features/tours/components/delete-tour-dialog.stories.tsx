import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DeleteTourDialog } from './delete-tour-dialog'

const meta = {
  title: 'Tours/Dialogs/DeleteTourDialog',
  component: DeleteTourDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    tourName: 'Ancient Rome Tour',
    confirmationInput: '',
    onConfirmationInputChange: fn(),
    isLoading: false,
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
  },
} satisfies Meta<typeof DeleteTourDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    tourName: 'Ancient Rome Tour',
  },
}

export const WithInputEntered: Story = {
  args: {
    open: true,
    tourName: 'The Louvre Collection',
    confirmationInput: 'permanently delete',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    tourName: 'Modern Art Exhibit',
    isLoading: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    tourName: 'Medieval Times',
  },
}
