// @ts-nocheck - Storybook types only available in storybook package
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideTranslation } from '@valguide/core/features/guides/schema'
import { fn } from 'storybook/test'
import { GuideMetadataForm } from './guide-metadata-form'

const meta = {
  title: 'Guides/GuideMetadataForm',
  component: GuideMetadataForm,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onTranslationChange: fn(),
    onCoverImageChange: fn(),
    organizationId: 'org-123',
  },
  argTypes: {
    onTranslationChange: { action: 'translation-changed' },
    onCoverImageChange: { action: 'cover-image-changed' },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
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

export const WithCoverImage: Story = {
  args: {
    locale: 'en',
    translation: mockTranslationEN,
    coverImage: faker.image.urlLoremFlickr({ width: 800, height: 450, category: 'art' }),
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
    coverImage: faker.image.urlLoremFlickr({ width: 800, height: 450, category: 'art' }),
  },
}
