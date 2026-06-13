import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RecoverTourDialog } from './recover-tour-dialog'

const meta = {
  title: 'Studio/Tours/Dialogs/RecoverTourDialog',
  component: RecoverTourDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    isLoading: false,
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
  },
} satisfies Meta<typeof RecoverTourDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
  },
}

export const Loading: Story = {
  args: {
    open: true,
    isLoading: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
