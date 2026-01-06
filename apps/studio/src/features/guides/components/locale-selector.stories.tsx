import type { Meta, StoryObj } from '@storybook/react'
import { LocaleSelector, type LocaleStatusMap } from './locale-selector'

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
      options: ['en', 'de', 'rm'],
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

export const WithStatusIndicators: Story = {
  args: {
    value: 'en',
    locales: ['en', 'de', 'rm'],
    onValueChange: () => {},
    localeStatus: {
      en: 'published',
      de: 'draft',
      rm: 'empty',
    } as LocaleStatusMap,
  },
}

export const AllPublished: Story = {
  args: {
    value: 'de',
    locales: ['en', 'de', 'rm'],
    onValueChange: () => {},
    localeStatus: {
      en: 'published',
      de: 'published',
      rm: 'published',
    } as LocaleStatusMap,
  },
}

export const AllDrafts: Story = {
  args: {
    value: 'rm',
    locales: ['en', 'de', 'rm'],
    onValueChange: () => {},
    localeStatus: {
      en: 'draft',
      de: 'draft',
      rm: 'draft',
    } as LocaleStatusMap,
  },
}

export const AllEmpty: Story = {
  args: {
    value: 'en',
    locales: ['en', 'de', 'rm'],
    onValueChange: () => {},
    localeStatus: {
      en: 'empty',
      de: 'empty',
      rm: 'empty',
    } as LocaleStatusMap,
  },
}
