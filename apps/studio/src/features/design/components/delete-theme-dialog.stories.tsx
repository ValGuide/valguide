import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DeleteThemeDialog } from './delete-theme-dialog'

const meta = {
  title: 'Design/Dialogs/DeleteThemeDialog',
  component: DeleteThemeDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    themeName: 'Modern Museum',
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
    isLoading: false,
  },
} satisfies Meta<typeof DeleteThemeDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    themeName: 'Modern Museum',
  },
}

export const DifferentTheme: Story = {
  args: {
    open: true,
    themeName: 'Classical Dark',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    themeName: 'Vintage Light',
    isLoading: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    themeName: 'Minimal Design',
  },
}
