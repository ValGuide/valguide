import type { Meta, StoryObj } from '@storybook/react'
import type { Asset } from '@valguide/core/features/assets/types'
import type { PropsWithChildren } from 'react'
import type { AssetUploadStatus } from './asset-upload-session.utils'
import { AssetUploadSessionContext, type AssetUploadSessionContextValue } from './asset-upload-session-context'
import { AssetsUploadSurface } from './assets-upload-surface'

const baseAsset: Asset = {
  id: 'asset-1',
  nanoId: 'assetNano1',
  fileName: 'image-1.jpg',
  fileSize: 2_048_576,
  mimeType: 'image/jpeg',
  type: 'image',
  storagePath: 'assets/mock/image-1.jpg',
  width: 1920,
  height: 1080,
  duration: null,
  organizationId: 'org-123',
  uploadedBy: 'user-123',
  createdAt: new Date('2026-03-24T08:00:00Z'),
  updatedAt: new Date('2026-03-24T08:00:00Z'),
}

function createItem(status: AssetUploadStatus, overrides?: Partial<AssetUploadSessionContextValue['items'][number]>) {
  return {
    id: overrides?.id ?? `upload-${status}`,
    file:
      overrides?.file ??
      new File(['demo'], overrides?.asset?.fileName ?? overrides?.file?.name ?? `asset-${status}.jpg`, {
        type: overrides?.asset?.mimeType ?? 'image/jpeg',
      }),
    type: overrides?.type ?? 'image',
    previewUrl: overrides?.previewUrl ?? null,
    status,
    progress: overrides?.progress ?? (status === 'complete' ? 100 : status === 'uploading' ? 48 : 0),
    error: overrides?.error ?? null,
    asset: overrides?.asset ?? null,
    createdAt: overrides?.createdAt ?? Date.now(),
  }
}

function MockSessionProvider({
  children,
  value,
}: PropsWithChildren<{ value: Partial<AssetUploadSessionContextValue> }>) {
  const contextValue: AssetUploadSessionContextValue = {
    items: [],
    isExpanded: true,
    isDragActive: false,
    hasVisibleUploads: true,
    aggregateProgress: 50,
    openFilePicker: () => undefined,
    setExpanded: () => undefined,
    closeSurface: () => undefined,
    dismissItem: () => undefined,
    retryItem: () => undefined,
    clearCompleted: () => undefined,
    ...value,
  }

  return <AssetUploadSessionContext.Provider value={contextValue}>{children}</AssetUploadSessionContext.Provider>
}

type UploadSurfaceStoryProps = {
  contextValue: Partial<AssetUploadSessionContextValue>
}

function UploadSurfaceStory({ contextValue }: UploadSurfaceStoryProps) {
  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <MockSessionProvider value={contextValue}>
        <AssetsUploadSurface />
      </MockSessionProvider>
    </div>
  )
}

const meta = {
  title: 'Assets/Upload/UploadSurface',
  component: UploadSurfaceStory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    contextValue: {
      control: false,
    },
  },
} satisfies Meta<typeof UploadSurfaceStory>

export default meta
type Story = StoryObj<typeof meta>

export const UploadingDesktop: Story = {
  args: {
    contextValue: {
      isExpanded: true,
      aggregateProgress: 42,
      items: [
        createItem('uploading', { id: 'upload-1', progress: 68 }),
        createItem('confirming', {
          id: 'upload-2',
          progress: 100,
          type: 'video',
          file: new File(['demo'], 'intro-video.mp4', { type: 'video/mp4' }),
        }),
        createItem('queued', {
          id: 'upload-3',
          type: 'audio',
          file: new File(['demo'], 'audio-guide.mp3', { type: 'audio/mpeg' }),
        }),
      ],
    },
  },
}

export const SuccessCollapsed: Story = {
  args: {
    contextValue: {
      isExpanded: false,
      aggregateProgress: 100,
      items: [
        createItem('complete', { id: 'complete-1', asset: baseAsset }),
        createItem('complete', {
          id: 'complete-2',
          asset: { ...baseAsset, id: 'asset-2', nanoId: 'assetNano2', fileName: 'image-2.jpg' },
          createdAt: Date.now() - 1_000,
        }),
      ],
    },
  },
}

export const PartialFailure: Story = {
  args: {
    contextValue: {
      isExpanded: true,
      aggregateProgress: 74,
      items: [
        createItem('complete', { id: 'complete-1', asset: baseAsset }),
        createItem('error', {
          id: 'error-1',
          type: 'video',
          file: new File(['demo'], 'large-video.mp4', { type: 'video/mp4' }),
          error: 'Upload failed: network error',
        }),
        createItem('error', {
          id: 'error-2',
          type: 'audio',
          file: new File(['demo'], 'narration.wav', { type: 'audio/wav' }),
          error: 'File size exceeds 50MB limit',
        }),
      ],
    },
  },
}
