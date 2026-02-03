import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { AddLanguageDialog } from './add-language-dialog'

const meta = {
  title: 'Tours/Dialogs/AddLanguageDialog',
  component: AddLanguageDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    existingLocales: ['en'],
    onAddLanguage: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }),
  },
} satisfies Meta<typeof AddLanguageDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    existingLocales: ['en'],
  },
}

export const MultipleLocalesExist: Story = {
  args: {
    open: true,
    existingLocales: ['en', 'de', 'fr'],
  },
}

export const ManyLocalesExist: Story = {
  args: {
    open: true,
    existingLocales: ['en', 'de', 'fr', 'it', 'es', 'pt', 'nl', 'pl'],
  },
}

export const Closed: Story = {
  args: {
    open: false,
    existingLocales: ['en', 'de'],
  },
}
