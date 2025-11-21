// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import { LocaleTabs } from './locale-tabs'
import { useState } from 'react'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import {fn} from '@storybook/test'

const meta = {
  title: 'Guides/LocaleTabs',
  component: LocaleTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LocaleTabs>

export default meta
type Story = StoryObj<typeof meta>

function LocaleTabsWrapper() {
  const [locale, setLocale] = useState<SupportedLocale>('en')
  return <LocaleTabs value={locale} onValueChange={setLocale} />
}

export const Default: Story = {
  render: () => <LocaleTabsWrapper />,
  args: {
    value: 'en',
    onValueChange: fn(),
  },
}

export const EnglishSelected: Story = {
  args: {
    value: 'en',
    onValueChange: fn(),
  },
}

export const GermanSelected: Story = {
  args: {
    value: 'de',
    onValueChange: fn(),
  },
}

export const RomanshSelected: Story = {
  args: {
    value: 'rm',
    onValueChange: fn(),
  },
}
