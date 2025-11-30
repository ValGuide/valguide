import type { Meta, StoryObj } from '@storybook/react'
import { PublishStopTranslationButton } from './publish-stop-translation-button'

const meta = {
  title: 'Features/Guides/PublishStopTranslationButton',
  component: PublishStopTranslationButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PublishStopTranslationButton>

export default meta
type Story = StoryObj<typeof meta>

export const WithDraft: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
  },
}

export const WithoutDraft: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    hasDraft: false,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    hasDraft: true,
    disabled: true,
  },
}

export const WithCallback: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
    onPublished: () => {
      console.log('Stop published callback')
    },
  },
}

export const GermanLocale: Story = {
  args: {
    stopId: 'stop-123',
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
    stopId: 'stop-123',
    locale: 'rm',
    hasDraft: true,
    disabled: false,
  },
  globals: {
    locale: 'rm',
  },
}
