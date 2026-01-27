import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ArchiveGuideDialog } from './archive-guide-dialog'

const meta = {
  title: 'Guides/Dialogs/ArchiveGuideDialog',
  component: ArchiveGuideDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    isArchiving: false,
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
  },
} satisfies Meta<typeof ArchiveGuideDialog>

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
    isArchiving: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
