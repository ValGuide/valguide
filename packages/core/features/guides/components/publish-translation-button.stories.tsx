import type { Meta, StoryObj } from '@storybook/react'
import { PublishTranslationButton } from './publish-translation-button'

const meta = {
  title: 'Features/Guides/PublishTranslationButton',
  component: PublishTranslationButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
