import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { RemoveLanguageDialog } from './remove-language-dialog'

const meta = {
  title: 'Studio/Tours/Dialogs/RemoveLanguageDialog',
  component: RemoveLanguageDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    locale: 'de',
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }),
  },
} satisfies Meta<typeof RemoveLanguageDialog>

export default meta
type Story = StoryObj<typeof meta>

export const German: Story = {
  args: {
    open: true,
    locale: 'de',
  },
}

export const Romansh: Story = {
  args: {
    open: true,
    locale: 'rm',
  },
}

export const French: Story = {
  args: {
    open: true,
    locale: 'fr',
  },
}

export const Closed: Story = {
  args: {
    open: false,
    locale: 'it',
  },
}

export const NoLocale: Story = {
  args: {
    open: true,
    locale: null,
  },
}
