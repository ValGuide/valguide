import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.server'
import { AssetCard, type DeleteAssetDialogComponentProps } from './asset-card'
import { DeleteAssetDialog } from './delete-asset-dialog'

function MockDeleteDialog(props: DeleteAssetDialogComponentProps) {
  return <DeleteAssetDialog {...props} onGetUsage={async () => ({ guides: [], stops: [] })} />
}

const meta = {
  title: 'Assets/AssetCard',
  component: AssetCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onDelete: { action: 'deleted' },
    onPreview: { action: 'previewed' },
  },
  args: {
    onDeleteAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    DeleteDialog: MockDeleteDialog,
  },
} satisfies Meta<typeof AssetCard>

export default meta
type Story = StoryObj<typeof meta>

const baseAsset: AssetWithUsage = {
  id: '1',
  nanoId: 'abc123',
  fileName: 'museum-photo.jpg',
  fileSize: 2048576, // 2MB
  mimeType: 'image/jpeg',
  type: 'image',
  storagePath: '',
  publicUrl: faker.image.urlLoremFlickr({ width: 400, height: 300, category: 'art' }),
  width: 1920,
  height: 1080,
  duration: null,
  organizationId: 'org-123',
  uploadedBy: 'user-456',
  createdAt: new Date('2025-01-10T10:00:00Z'),
  updatedAt: new Date('2025-01-10T10:00:00Z'),
  guideCount: 0,
  stopCount: 0,
}

export const ImageAsset: Story = {
  args: {
    asset: baseAsset,
  },
}

export const ImageAssetGerman: Story = {
  args: {
    asset: {
      ...baseAsset,
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

export const UsedInGuides: Story = {
  args: {
    asset: {
      ...baseAsset,
      guideCount: 2,
      stopCount: 0,
    },
  },
}

export const UsedInStops: Story = {
  args: {
    asset: {
      ...baseAsset,
      guideCount: 0,
      stopCount: 3,
    },
  },
}

export const UsedInBoth: Story = {
  args: {
    asset: {
      ...baseAsset,
      guideCount: 2,
      stopCount: 1,
    },
  },
}

function MockDeleteDialogWithUsage(props: DeleteAssetDialogComponentProps) {
  return (
    <DeleteAssetDialog
      {...props}
      onGetUsage={async () => ({
        guides: [{ id: 'g1', nanoId: 'guide1', name: 'City Tour Guide', channel: 'cover', locale: 'en' }],
        stops: [
          { id: 's1', nanoId: 'stop1', name: 'Museum Entrance', channel: 'media', locale: 'en' },
          { id: 's2', nanoId: 'stop2', name: 'Art Gallery', channel: 'media', locale: null },
        ],
      })}
    />
  )
}

export const WithUsageWarning: Story = {
  args: {
    asset: {
      ...baseAsset,
      guideCount: 1,
      stopCount: 2,
    },
    DeleteDialog: MockDeleteDialogWithUsage,
  },
}
