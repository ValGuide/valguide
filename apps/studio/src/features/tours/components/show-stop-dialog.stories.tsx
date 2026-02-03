import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ShowStopDialog } from './show-stop-dialog'

const meta = {
  title: 'Tours/Dialogs/ShowStopDialog',
  component: ShowStopDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    stopTitle: 'The Mona Lisa',
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }),
  },
} satisfies Meta<typeof ShowStopDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    stopTitle: 'The Mona Lisa',
  },
}

export const DifferentStop: Story = {
  args: {
    open: true,
    stopTitle: 'Ancient Greek Pottery',
  },
}

export const LongTitle: Story = {
  args: {
    open: true,
    stopTitle: 'The Winged Victory of Samothrace with its remarkable marble sculpture and historical significance',
  },
}

export const Closed: Story = {
  args: {
    open: false,
    stopTitle: 'Medieval Manuscripts',
  },
}
