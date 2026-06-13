import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { SaveThemeDialog } from './save-theme-dialog'

const meta = {
  title: 'Studio/Design/Dialogs/SaveThemeDialog',
  component: SaveThemeDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    existingThemeId: undefined,
    existingThemeName: undefined,
    onSave: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }),
    isLoading: false,
    error: null,
  },
} satisfies Meta<typeof SaveThemeDialog>

export default meta
type Story = StoryObj<typeof meta>

export const NewTheme: Story = {
  args: {
    open: true,
    existingThemeId: undefined,
    existingThemeName: undefined,
  },
}

export const UpdateExisting: Story = {
  args: {
    open: true,
    existingThemeId: 'theme-123',
    existingThemeName: 'Modern Museum',
  },
}

export const Loading: Story = {
  args: {
    open: true,
    existingThemeId: 'theme-456',
    existingThemeName: 'Classical',
    isLoading: true,
  },
}

export const WithError: Story = {
  args: {
    open: true,
    existingThemeId: undefined,
    existingThemeName: undefined,
    error: 'Theme name already exists',
  },
}

export const Closed: Story = {
  args: {
    open: false,
    existingThemeId: 'theme-789',
    existingThemeName: 'Vintage',
  },
}
