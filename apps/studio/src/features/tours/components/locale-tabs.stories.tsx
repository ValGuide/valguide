// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { LocaleTabs } from './locale-tabs'

const meta = {
  title: 'Tours/LocaleTabs',
  component: LocaleTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LocaleTabs>

export default meta
type Story = StoryObj<typeof meta>

function LocaleTabsWrapper() {
  const [locale, setLocale] = useState('en')
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
