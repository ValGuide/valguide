import type { Meta, StoryObj } from '@storybook/react'
import type { PublishStopTranslationResult } from './publish-stop-translation-button'
import { PublishStopTranslationButton } from './publish-stop-translation-button'

const mockPublishAction = async (): Promise<PublishStopTranslationResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

const meta = {
  title: 'Features/Guides/PublishStopTranslationButton',
  component: PublishStopTranslationButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onPublishAction: mockPublishAction,
  },
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

export const WithError: Story = {
  args: {
    stopId: 'stop-123',
    locale: 'en',
    hasDraft: true,
    disabled: false,
    onPublishAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, error: 'Failed to publish' }
    },
  },
}
