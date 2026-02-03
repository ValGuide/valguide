import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ArchiveTourDialog } from './archive-tour-dialog'

const meta = {
  title: 'Tours/Dialogs/ArchiveTourDialog',
  component: ArchiveTourDialog,
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
} satisfies Meta<typeof ArchiveTourDialog>

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
