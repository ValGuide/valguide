import type { Meta, StoryObj } from '@storybook/react'
import deMessages from '@valguide/i18n/messages/de.json'
// Import messages for the story
import enMessages from '@valguide/i18n/messages/en.json'
import rmMessages from '@valguide/i18n/messages/rm.json'
import { NextIntlClientProvider } from 'next-intl'
import { PublishTranslationButton } from './publish-translation-button'

const meta = {
  title: 'Features/Guides/PublishTranslationButton',
  component: PublishTranslationButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType, { globals: { locale } }: { globals: { locale?: string } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      const currentLocale = locale || 'en'

      return (
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <Story />
        </NextIntlClientProvider>
      )
    },
  ],
  args: {
    // Action handlers are auto-wired via the Actions addon
  },
} satisfies Meta<typeof PublishTranslationButton>

export default meta
type Story = StoryObj<typeof meta>

export const WithDraft: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
  },
}

export const WithoutDraft: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: false,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: true,
    disabled: true,
  },
}

export const WithCallback: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
  },
}

export const GermanLocale: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'de',
    hasDraft: true,
    disabled: false,
  },
  globals: {
    locale: 'de',
  },
}

export const RomanshLocale: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'rm',
    hasDraft: true,
    disabled: false,
  },
  globals: {
    locale: 'rm',
  },
}
