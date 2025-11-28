import type { Meta, StoryObj } from '@storybook/react'
import type { Asset } from '@valguide/core/features/assets/schema'
import { AssetCard } from './asset-card'

const meta = {
  title: 'Assets/AssetCard',
  component: AssetCard,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onDelete: { action: 'deleted' },
    onPreview: { action: 'previewed' },
  },
  args: {
    mockDelete: true,
  },
} satisfies Meta<typeof AssetCard>

export default meta
type Story = StoryObj<typeof meta>

const baseAsset: Asset = {
  id: '1',
  nanoId: 'abc123',
  fileName: 'museum-photo.jpg',
  fileSize: 2048576, // 2MB
  mimeType: 'image/jpeg',
  type: 'image',
  storagePath: 'org-123/images/user-456/abc123-museum-photo.jpg',
  publicUrl: 'https://picsum.photos/400/300',
  locale: null,
  width: 1920,
  height: 1080,
  duration: null,
  organizationId: 'org-123',
  uploadedBy: 'user-456',
  createdAt: new Date('2025-01-10T10:00:00Z'),
  updatedAt: new Date('2025-01-10T10:00:00Z'),
}

export const ImageAsset: Story = {
  args: {
    asset: baseAsset,
  },
}

export const ImageAssetWithLocale: Story = {
  args: {
    asset: {
      ...baseAsset,
      locale: 'de',
      fileName: 'german-exhibit.jpg',
    },
  },
}

export const AudioAsset: Story = {
  args: {
    asset: {
      ...baseAsset,
      id: '2',
      type: 'audio',
      fileName: 'narration-en.mp3',
      fileSize: 5242880, // 5MB
      mimeType: 'audio/mpeg',
      locale: 'en',
      publicUrl: null,
      width: null,
      height: null,
      duration: 180, // 3 minutes
    },
  },
}

export const VideoAsset: Story = {
  args: {
    asset: {
      ...baseAsset,
      id: '3',
      type: 'video',
      fileName: 'intro-video.mp4',
      fileSize: 52428800, // 50MB
      mimeType: 'video/mp4',
      locale: 'rm',
      publicUrl: null,
      width: 1920,
      height: 1080,
      duration: 120, // 2 minutes
    },
  },
}

export const LargeFileName: Story = {
  args: {
    asset: {
      ...baseAsset,
      fileName: 'this-is-a-very-long-filename-for-an-image-that-should-be-truncated-in-the-ui.jpg',
    },
  },
}

export const SmallFile: Story = {
  args: {
    asset: {
      ...baseAsset,
      fileSize: 1024, // 1KB
    },
  },
}

export const RecentUpload: Story = {
  args: {
    asset: {
      ...baseAsset,
      createdAt: new Date(),
    },
  },
}

export const OldUpload: Story = {
  args: {
    asset: {
      ...baseAsset,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    },
  },
}
