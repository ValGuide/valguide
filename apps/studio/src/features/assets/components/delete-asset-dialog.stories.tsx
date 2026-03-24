import type { Meta, StoryObj } from '@storybook/react'
import type { AssetUsageDetails } from '@valguide/core/features/assets/get-asset-usage.fn'
import { fn } from 'storybook/test'
import { DeleteAssetDialog } from './delete-asset-dialog'

const meta = {
  title: 'Assets/Dialogs/DeleteAssetDialog',
  component: DeleteAssetDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    assetId: 'asset-123',
    fileName: 'museum-image.jpg',
    isDeleting: false,
    onConfirmDelete: fn(),
    onGetUsage: fn(
      async (): Promise<AssetUsageDetails> => ({
        tours: [],
        stops: [],
      }),
    ),
  },
} satisfies Meta<typeof DeleteAssetDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    assetId: 'asset-123',
    fileName: 'ancient-artifact.jpg',
  },
}

export const WithUsageInTours: Story = {
  args: {
    open: true,
    assetId: 'asset-456',
    fileName: 'sculpture-photo.jpg',
    onGetUsage: fn(
      async (): Promise<AssetUsageDetails> => ({
        tours: [
          { id: '1', nanoId: 'tour-001', name: 'Ancient Rome Tour', channel: 'en', locale: 'en', scope: 'published' },
          { id: '2', nanoId: 'tour-002', name: 'Louvre Collection', channel: 'de', locale: 'de', scope: 'draft' },
        ],
        stops: [],
      }),
    ),
  },
}

export const WithUsageInStops: Story = {
  args: {
    open: true,
    assetId: 'asset-789',
    fileName: 'painting.jpg',
    onGetUsage: fn(
      async (): Promise<AssetUsageDetails> => ({
        tours: [],
        stops: [
          { id: 'stop-1', nanoId: 'stop-001', name: 'The Mona Lisa', channel: 'en', locale: 'en', scope: 'published' },
          { id: 'stop-2', nanoId: 'stop-002', name: 'Venus de Milo', channel: 'fr', locale: 'fr', scope: 'draft' },
        ],
      }),
    ),
  },
}

export const WithUsageInBoth: Story = {
  args: {
    open: true,
    assetId: 'asset-all',
    fileName: 'important-asset.mp3',
    onGetUsage: fn(
      async (): Promise<AssetUsageDetails> => ({
        tours: [
          {
            id: '1',
            nanoId: 'tour-xyz',
            name: 'Main Exhibition',
            channel: 'en',
            locale: 'en',
            scope: 'draftAndPublished',
          },
        ],
        stops: [
          {
            id: 'stop-abc',
            nanoId: 'stop-xyz',
            name: 'Featured Stop',
            channel: 'de',
            locale: 'de',
            scope: 'published',
          },
        ],
      }),
    ),
  },
}

export const Loading: Story = {
  args: {
    open: true,
    assetId: 'asset-loading',
    fileName: 'document.pdf',
    isDeleting: true,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    assetId: 'asset-closed',
    fileName: 'file.mov',
  },
}
