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
      title: 'The Great Hall',
      description:
        'Welcome to the magnificent Great Hall, built in 1872. This space has hosted countless exhibitions and gatherings.',
      transcription: 'Welcome to the Great Hall. Notice the intricate ceiling details and the marble columns.',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
    },
  ],
}

const mockStopDE: StopWithTranslations = {
  id: 'stop-2',
  guideId: 'guide-123',
  nanoId: 'def456ghi789',
  order: 1,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-15'),
  createdBy: 'user-1',
  translations: [
    {
      id: 'trans-2',
      stopId: 'stop-2',
      locale: 'de',
      title: 'Der Große Saal',
      description:
        'Willkommen im prächtigen Großen Saal, erbaut 1872. Dieser Raum war Schauplatz zahlreicher Ausstellungen und Veranstaltungen.',
      transcription: 'Willkommen im Großen Saal. Beachten Sie die kunstvollen Deckendetails und die Marmorsäulen.',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
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
      title: 'This is a very long stop title that demonstrates how the editor handles lengthy titles and text wrapping',
      description:
        "This is an extensive description that contains multiple paragraphs of text. It describes the artwork, its historical context, the artist's background, and the techniques used in creating this masterpiece.\n\nThe second paragraph continues with more detailed information about the restoration process, the materials used, and the significance of this piece in the broader context of art history.\n\nThe third paragraph explores the symbolism and hidden meanings within the work, inviting viewers to look deeper and discover new interpretations with each viewing.",
      transcription:
        "Welcome to this comprehensive audio guide. In this extended transcription, we will explore every aspect of this remarkable piece. The artist spent over five years creating this work, meticulously planning each element to convey a specific message.\n\nAs you observe the painting, notice the play of light and shadow, the careful composition, and the emotional depth captured in the subjects' expressions. Each brushstroke was intentional, each color choice deliberate.\n\nThe background reveals subtle details that reward careful observation. Take your time to discover the hidden elements that the artist has woven throughout the composition.",
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
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

export const ExistingStopGerman: Story = {
  args: {
    locale: 'de',
    stop: mockStopDE,
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

export const RomanshEmpty: Story = {
  args: {
    locale: 'rm',
    stop: undefined,
  },
}
