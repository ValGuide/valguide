import type { Meta, StoryObj } from '@storybook/react'
import { GuideMetadataForm } from './guide-metadata-form'
import type { GuideTranslation } from '@valguide/core/features/guides/schema'

const meta = {
  title: 'Guides/GuideMetadataForm',
  component: GuideMetadataForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onTranslationChange: { action: 'translation-changed' },
    onCoverImageChange: { action: 'cover-image-changed' },
    onSelectCoverImage: { action: 'select-cover-image' },
  },
} satisfies Meta<typeof GuideMetadataForm>

export default meta
type Story = StoryObj<typeof meta>

const mockTranslationEN: GuideTranslation = {
  id: '1',
  guideId: 'guide-123',
  locale: 'en',
  title: 'Museum Tour 2025',
  description: 'Explore our newest exhibition featuring contemporary art and historical artifacts.',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockTranslationDE: GuideTranslation = {
  id: '2',
  guideId: 'guide-123',
  locale: 'de',
  title: 'Museumsführung 2025',
  description: 'Entdecken Sie unsere neueste Ausstellung mit zeitgenössischer Kunst und historischen Artefakten.',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

export const EnglishEmpty: Story = {
  args: {
    locale: 'en',
    translation: undefined,
  },
}

export const EnglishWithContent: Story = {
  args: {
    locale: 'en',
    translation: mockTranslationEN,
  },
}

export const GermanWithContent: Story = {
  args: {
    locale: 'de',
    translation: mockTranslationDE,
  },
}

export const RomanshEmpty: Story = {
  args: {
    locale: 'rm',
    translation: undefined,
  },
}

export const WithCoverImage: Story = {
  args: {
    locale: 'en',
    translation: mockTranslationEN,
    coverImage: 'https://picsum.photos/800/450',
  },
}

export const WithoutCoverImage: Story = {
  args: {
    locale: 'en',
    translation: mockTranslationEN,
    coverImage: null,
  },
}

export const LongContent: Story = {
  args: {
    locale: 'en',
    translation: {
      ...mockTranslationEN,
      title: 'This is a very long guide title that might need to be truncated or wrapped in the UI to fit properly',
      description:
        'This is a very long description that spans multiple lines. It contains detailed information about the guide, including historical context, what visitors will see, how long it takes, and any special requirements or recommendations for the tour. This helps test the textarea component with substantial content.',
    },
    coverImage: 'https://picsum.photos/800/450',
  },
}
