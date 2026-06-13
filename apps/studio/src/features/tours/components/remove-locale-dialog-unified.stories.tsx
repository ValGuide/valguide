import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RemoveLocaleDialogUnified } from './remove-locale-dialog-unified'

const meta = {
  title: 'Studio/Tours/Dialogs/RemoveLocaleDialogUnified',
  component: RemoveLocaleDialogUnified,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    localeName: 'German',
    isLoading: false,
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
  },
} satisfies Meta<typeof RemoveLocaleDialogUnified>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    localeName: 'German',
  },
}

export const DifferentLocale: Story = {
  args: {
    open: true,
    localeName: 'Spanish',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    localeName: 'Portuguese',
    isLoading: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    localeName: 'French',
  },
}
