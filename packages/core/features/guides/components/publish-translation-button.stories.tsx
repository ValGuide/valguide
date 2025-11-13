import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { PublishTranslationButton } from './publish-translation-button'

// Import messages for the story
import enMessages from '@valguide/i18n/messages/en.json'
import deMessages from '@valguide/i18n/messages/de.json'
import rmMessages from '@valguide/i18n/messages/rm.json'

// Mock the server action module
const mockPublishGuideTranslationDraft = async (guideId: string, locale: string) => {
  console.log('Publishing draft:', { guideId, locale })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

// Mock the translation-actions module
jest.mock('../translation-actions', () => ({
  publishGuideTranslationDraft: mockPublishGuideTranslationDraft,
}))

const meta = {
  title: 'Features/Guides/PublishTranslationButton',
  component: PublishTranslationButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { globals: { locale } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      const currentLocale = locale || 'en'

      return (
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <Story />
        </NextIntlClientProvider>
      )
    },
  ],
  argTypes: {
    onPublished: { action: 'published' },
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
    onPublished: fn(),
  },
}

export const WithoutDraft: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: false,
    disabled: false,
    onPublished: fn(),
  },
}

export const Disabled: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: true,
    disabled: true,
    onPublished: fn(),
  },
}

export const WithCallback: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
    onPublished: () => {
      console.log('Translation published callback')
    },
  },
}

export const GermanLocale: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'de',
    hasDraft: true,
    disabled: false,
    onPublished: fn(),
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
    onPublished: fn(),
  },
  globals: {
    locale: 'rm',
  },
}
