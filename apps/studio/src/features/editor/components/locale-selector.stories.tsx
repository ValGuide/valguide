import type { Meta, StoryObj } from '@storybook/react'
import { LocaleSelector } from './locale-selector'

const meta = {
  title: 'Studio/Editor/LocaleSelector',
  component: LocaleSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['en', 'de', 'rm', 'fr', 'it', 'es', 'pt', 'nl'],
    },
    onValueChange: { action: 'onValueChange' },
  },
} satisfies Meta<typeof LocaleSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'en',
    locales: ['en', 'de', 'rm'],
    onValueChange: () => {},
  },
}

export const ManyLocales: Story = {
  args: {
    value: 'en',
    locales: ['en', 'de', 'rm', 'fr', 'it', 'es', 'pt', 'nl'],
    onValueChange: () => {},
  },
}
