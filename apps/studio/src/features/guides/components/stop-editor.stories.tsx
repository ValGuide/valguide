// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import type { Asset } from '@valguide/core/features/assets/schema'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { fn } from 'storybook/test'
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
  args: {
    onChange: fn(),
    onImageChange: fn(),
    onAudioChange: fn(),
    organizationId: 'org-123',
  },
  argTypes: {
    onChange: { action: 'change' },
    onImageChange: { action: 'image-change' },
    onAudioChange: { action: 'audio-change' },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StopEditor>

export default meta
type Story = StoryObj<typeof meta>

const mockImageAsset: Asset = {
  id: '1',
  nanoId: 'img1',
  fileName: 'gallery-image.jpg',
  fileSize: 2048576,
  mimeType: 'image/jpeg',
  type: 'image',
  storagePath: '',
  publicUrl: 'https://picsum.photos/seed/1/400/300',
  locale: null,
  width: 1920,
  height: 1080,
  duration: null,
  organizationId: 'org-123',
  uploadedBy: 'user-456',
  createdAt: new Date('2025-01-10T10:00:00Z'),
  updatedAt: new Date('2025-01-10T10:00:00Z'),
}

const mockAudioAsset: Asset = {
  id: '2',
  nanoId: 'aud1',
  fileName: 'narration-en.mp3',
  fileSize: 5242880,
  mimeType: 'audio/mpeg',
  type: 'audio',
  storagePath: '',
  publicUrl: null,
  locale: 'en',
  width: null,
  height: null,
  duration: 180,
  organizationId: 'org-123',
  uploadedBy: 'user-456',
  createdAt: new Date('2025-01-08T09:15:00Z'),
  updatedAt: new Date('2025-01-08T09:15:00Z'),
}

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
    images: [
      mockImageAsset,
      { ...mockImageAsset, id: '2', publicUrl: 'https://picsum.photos/seed/2/400/300' },
      { ...mockImageAsset, id: '3', publicUrl: 'https://picsum.photos/seed/3/400/300' },
    ],
  },
}

export const StopWithAudio: Story = {
  args: {
    locale: 'en',
    stop: mockStopEN,
    audio: mockAudioAsset,
  },
}

export const StopWithAllMedia: Story = {
  args: {
    locale: 'en',
    stop: mockStopEN,
    images: [mockImageAsset, { ...mockImageAsset, id: '2', publicUrl: 'https://picsum.photos/seed/2/400/300' }],
    audio: mockAudioAsset,
  },
}
