import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DeleteGuideDialog } from './delete-guide-dialog'

const meta = {
  title: 'Guides/Dialogs/DeleteGuideDialog',
  component: DeleteGuideDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    guideName: 'Ancient Rome Tour',
    confirmationInput: '',
    onConfirmationInputChange: fn(),
    isLoading: false,
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
  },
} satisfies Meta<typeof DeleteGuideDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    guideName: 'Ancient Rome Tour',
  },
}

export const WithInputEntered: Story = {
  args: {
    open: true,
    guideName: 'The Louvre Collection',
    confirmationInput: 'permanently delete',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    guideName: 'Modern Art Exhibit',
    isLoading: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    guideName: 'Medieval Times',
  },
}
