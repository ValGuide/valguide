// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { StopEditor } from './stop-editor'

const meta = {
  title: 'Guides/StopEditor',
  component: StopEditor,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSave: { action: 'save' },
    onCancel: { action: 'cancel' },
    onSelectImages: { action: 'select-images' },
    onSelectAudio: { action: 'select-audio' },
    onSelectVideo: { action: 'select-video' },
  },
} satisfies Meta<typeof StopEditor>

export default meta
type Story = StoryObj<typeof meta>

const mockStopEN: StopWithTranslations = {
  id: 'stop-1',
  guideId: 'guide-123',
  nanoId: 'abc123def456',
  order: 0,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-15'),
  createdBy: 'user-1',
  translations: [
    {
      id: 'trans-1',
      stopId: 'stop-1',
      locale: 'en',
      currentVersionId: 'v1',
      draftVersionId: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      currentVersion: {
        id: 'v1',
        translationId: 'trans-1',
        version: 1,
        status: 'published',
        title: 'The Great Hall',
        description:
          'Welcome to the magnificent Great Hall, built in 1872. This space has hosted countless exhibitions and gatherings.',
        transcription: 'Welcome to the Great Hall. Notice the intricate ceiling details and the marble columns.',
        createdAt: new Date('2025-01-01'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-01'),
      },
      draftVersion: null,
    },
  ],
}

const mockStopWithDraft: StopWithTranslations = {
  id: 'stop-1',
  guideId: 'guide-123',
  nanoId: 'abc123def456',
  order: 0,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-15'),
  createdBy: 'user-1',
  translations: [
    {
      id: 'trans-1',
      stopId: 'stop-1',
      locale: 'en',
      currentVersionId: 'v1',
      draftVersionId: 'v2',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      currentVersion: {
        id: 'v1',
        translationId: 'trans-1',
        version: 1,
        status: 'published',
        title: 'The Great Hall',
        description: 'Welcome to the magnificent Great Hall.',
        transcription: 'Welcome to the Great Hall.',
        createdAt: new Date('2025-01-01'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-01'),
      },
      draftVersion: {
        id: 'v2',
        translationId: 'trans-1',
        version: 2,
        status: 'draft',
        title: 'The Great Hall - Updated',
        description:
          'Welcome to the magnificent Great Hall, built in 1872. This space has hosted countless exhibitions and gatherings. (Updated with more details)',
        transcription:
          'Welcome to the Great Hall. Notice the intricate ceiling details and the marble columns. (Updated transcription)',
        createdAt: new Date('2025-01-15'),
        createdBy: 'user-1',
        publishedAt: null,
      },
    },
  ],
}

const mockStopDraftOnly: StopWithTranslations = {
  id: 'stop-1',
  guideId: 'guide-123',
  nanoId: 'abc123def456',
  order: 0,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-15'),
  createdBy: 'user-1',
  translations: [
    {
      id: 'trans-1',
      stopId: 'stop-1',
      locale: 'en',
      currentVersionId: null,
      draftVersionId: 'v1',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      currentVersion: null,
      draftVersion: {
        id: 'v1',
        translationId: 'trans-1',
        version: 1,
        status: 'draft',
        title: 'New Stop - Never Published',
        description: 'This is a new stop that has not been published yet.',
        transcription: 'Draft transcription content.',
        createdAt: new Date('2025-01-15'),
        createdBy: 'user-1',
        publishedAt: null,
      },
    },
  ],
}

const mockStopLongContent: StopWithTranslations = {
  id: 'stop-3',
  guideId: 'guide-123',
  nanoId: 'ghi789jkl012',
  order: 2,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-15'),
  createdBy: 'user-1',
  translations: [
    {
      id: 'trans-3',
      stopId: 'stop-3',
      locale: 'en',
      currentVersionId: 'v1',
      draftVersionId: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      currentVersion: {
        id: 'v1',
        translationId: 'trans-3',
        version: 1,
        status: 'published',
        title:
          'This is a very long stop title that demonstrates how the editor handles lengthy titles and text wrapping',
        description:
          "This is an extensive description that contains multiple paragraphs of text. It describes the artwork, its historical context, the artist's background, and the techniques used in creating this masterpiece.\n\nThe second paragraph continues with more detailed information about the restoration process, the materials used, and the significance of this piece in the broader context of art history.\n\nThe third paragraph explores the symbolism and hidden meanings within the work, inviting viewers to look deeper and discover new interpretations with each viewing.",
        transcription:
          "Welcome to this comprehensive audio guide. In this extended transcription, we will explore every aspect of this remarkable piece. The artist spent over five years creating this work, meticulously planning each element to convey a specific message.\n\nAs you observe the painting, notice the play of light and shadow, the careful composition, and the emotional depth captured in the subjects' expressions. Each brushstroke was intentional, each color choice deliberate.\n\nThe background reveals subtle details that reward careful observation. Take your time to discover the hidden elements that the artist has woven throughout the composition.",
        createdAt: new Date('2025-01-01'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-01'),
      },
      draftVersion: null,
    },
  ],
}

export const NewStop: Story = {
  args: {
    locale: 'en',
    stop: undefined,
  },
}

export const ExistingStopEnglish: Story = {
  args: {
    locale: 'en',
    stop: mockStopEN,
  },
}

export const StopWithDraftChanges: Story = {
  args: {
    locale: 'en',
    stop: mockStopWithDraft,
  },
}

export const StopDraftOnly: Story = {
  args: {
    locale: 'en',
    stop: mockStopDraftOnly,
  },
}

export const StopWithImages: Story = {
  args: {
    locale: 'en',
    stop: mockStopEN,
  },
}

export const StopWithAudioEN: Story = {
  args: {
    locale: 'en',
    stop: mockStopEN,
  },
}

export const StopWithVideoDE: Story = {
  args: {
    locale: 'de',
    stop: mockStopDE,
  },
}

export const StopWithAllMedia: Story = {
  args: {
    locale: 'en',
    stop: mockStopEN,
  },
}

export const LongContent: Story = {
  args: {
    locale: 'en',
    stop: mockStopLongContent,
  },
}
