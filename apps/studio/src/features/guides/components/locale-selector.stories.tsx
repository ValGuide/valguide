import type { Meta, StoryObj } from '@storybook/react'
import { LocaleSelector } from './locale-selector'

const meta = {
  title: 'Studio/Guides/LocaleSelector',
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

export const WithManageLink: Story = {
  args: {
    value: 'en',
    locales: ['en', 'de', 'rm'],
    onValueChange: () => {},
    guideNanoId: 'abc123xyz',
  },
}

export const ManyLocales: Story = {
  args: {
    value: 'en',
    locales: ['en', 'de', 'rm', 'fr', 'it', 'es', 'pt', 'nl'],
    onValueChange: () => {},
    guideNanoId: 'abc123xyz',
  },
}
