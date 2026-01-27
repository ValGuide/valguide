import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RemoveLocaleDialog } from './remove-locale-dialog'

const meta = {
  title: 'Guides/Dialogs/RemoveLocaleDialog',
  component: RemoveLocaleDialog,
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
} satisfies Meta<typeof RemoveLocaleDialog>

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
    localeName: 'Romansh',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    localeName: 'French',
    isLoading: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    localeName: 'Italian',
  },
}
