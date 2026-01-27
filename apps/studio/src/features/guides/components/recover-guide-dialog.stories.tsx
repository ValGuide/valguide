import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RecoverGuideDialog } from './recover-guide-dialog'

const meta = {
  title: 'Guides/Dialogs/RecoverGuideDialog',
  component: RecoverGuideDialog,
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
} satisfies Meta<typeof RecoverGuideDialog>

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
