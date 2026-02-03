import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { AssetCard, type DeleteAssetDialogComponentProps } from './asset-card'
import { type AssetCardComponentProps, AssetsList } from './assets-list'
import { AssetsListSkeleton } from './assets-list-skeleton'
import { DeleteAssetDialog } from './delete-asset-dialog'

function MockDeleteDialog(props: DeleteAssetDialogComponentProps) {
  return <DeleteAssetDialog {...props} onGetUsage={async () => ({ tours: [], stops: [] })} />
}

function MockAssetCard({ asset, onDelete }: AssetCardComponentProps) {
  return (
    <AssetCard
      asset={asset}
      onDelete={onDelete}
      onDeleteAction={async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }}
      DeleteDialog={MockDeleteDialog}
    />
  )
}

function MockUploadInline() {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
      <p className="text-muted-foreground">Upload component (mocked for Storybook)</p>
    </div>
  )
}

const meta = {
  title: 'Assets/AssetsList',
  component: AssetsList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onAssetDeleted: { action: 'asset-deleted' },
    onUploadComplete: { action: 'upload-complete' },
  },
  args: {
    assets: [],
    AssetCard: MockAssetCard,
    UploadInline: MockUploadInline,
  },
} satisfies Meta<typeof AssetsList>

export default meta
type Story = StoryObj<typeof meta>

const mockAssets: AssetWithUsage[] = [
  {
    id: '1',
    nanoId: 'img1',
    fileName: 'museum-entrance.jpg',
    fileSize: 2048576,
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
    tourCount: 2,
    stopCount: 1,
  },
  {
    id: '2',
    nanoId: 'img2',
    fileName: 'artifact-display.jpg',
    fileSize: 3145728,
    mimeType: 'image/jpeg',
    type: 'image',
    storagePath: '',
    publicUrl: faker.image.urlLoremFlickr({ width: 400, height: 300, category: 'museum' }),
    width: 1920,
    height: 1080,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-09T14:30:00Z'),
    updatedAt: new Date('2025-01-09T14:30:00Z'),
    tourCount: 0,
    stopCount: 3,
  },
  {
    id: '3',
    nanoId: 'aud1',
    fileName: 'intro-narration-en.mp3',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
    type: 'audio',
    storagePath: '',
    publicUrl: null,
    width: null,
    height: null,
    duration: 180,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-08T09:15:00Z'),
    updatedAt: new Date('2025-01-08T09:15:00Z'),
    tourCount: 1,
    stopCount: 0,
  },
  {
    id: '4',
    nanoId: 'aud2',
    fileName: 'intro-narration-de.mp3',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
    type: 'audio',
    storagePath: '',
    publicUrl: null,
    width: null,
    height: null,
    duration: 185,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-08T09:20:00Z'),
    updatedAt: new Date('2025-01-08T09:20:00Z'),
    tourCount: 0,
    stopCount: 0,
  },
  {
    id: '5',
    nanoId: 'vid1',
    fileName: 'welcome-video-en.mp4',
    fileSize: 52428800,
    mimeType: 'video/mp4',
    type: 'video',
    storagePath: '',
    publicUrl: null,
    width: 1920,
    height: 1080,
    duration: 120,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-07T16:45:00Z'),
    updatedAt: new Date('2025-01-07T16:45:00Z'),
    tourCount: 0,
    stopCount: 2,
  },
  {
    id: '6',
    nanoId: 'img3',
    fileName: 'sculpture-closeup.jpg',
    fileSize: 4194304,
    mimeType: 'image/jpeg',
    type: 'image',
    storagePath: '',
    publicUrl: faker.image.urlLoremFlickr({ width: 400, height: 300, category: 'sculpture' }),
    width: 2560,
    height: 1440,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-06T11:00:00Z'),
    updatedAt: new Date('2025-01-06T11:00:00Z'),
    tourCount: 0,
    stopCount: 0,
  },
]

export const Default: Story = {
  args: {
    assets: mockAssets,
    locale: 'en',
    organizationId: 'org-123',
  },
}

export const Empty: Story = { args: { assets: [], locale: 'en', organizationId: 'org-123' } }

export const ErrorState: Story = {
  args: {
    error: new globalThis.Error('Failed to load assets from server'),
    locale: 'en',
    organizationId: 'org-123',
  },
}

export const OnlyImages: Story = {
  args: {
    assets: mockAssets.filter((a) => a.type === 'image'),
    locale: 'en',
    organizationId: 'org-123',
  },
}

export const OnlyAudio: Story = {
  args: {
    assets: mockAssets.filter((a) => a.type === 'audio'),
    locale: 'en',
    organizationId: 'org-123',
  },
}

export const OnlyVideo: Story = {
  args: {
    assets: mockAssets.filter((a) => a.type === 'video'),
    locale: 'en',
    organizationId: 'org-123',
  },
}

export const ManyAssets: Story = {
  args: {
    assets: [...mockAssets, ...mockAssets, ...mockAssets].map((asset, i) => ({
      ...asset,
      id: `${asset.id}-${i}`,
      nanoId: `${asset.nanoId}-${i}`,
    })),
    locale: 'en',
    organizationId: 'org-123',
  },
}

export const Loading: StoryObj = {
  render: () => <AssetsListSkeleton />,
}
