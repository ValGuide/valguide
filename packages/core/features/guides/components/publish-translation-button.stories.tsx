import type { Meta, StoryObj } from '@storybook/react'
import type { PublishTranslationResult } from './publish-translation-button'
import { PublishTranslationButton } from './publish-translation-button'

const mockPublishAction = async (): Promise<PublishTranslationResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

const meta = {
  title: 'Features/Guides/PublishTranslationButton',
  component: PublishTranslationButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onPublishAction: mockPublishAction,
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
    onPublished: () => {
      console.log('Guide published callback')
    },
  },
}

export const WithError: Story = {
  args: {
    guideId: 'guide-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
    onPublishAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, error: 'Failed to publish' }
    },
  },
}
