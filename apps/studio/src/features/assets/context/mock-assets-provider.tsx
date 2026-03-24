import { faker } from '@faker-js/faker'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import type { Asset } from '@valguide/core/features/assets/types'
import type { ReactNode } from 'react'
import { AssetsContext, type AssetsContextValue } from './assets-context'

const mockMuseumEntranceImageUrl = faker.image.urlLoremFlickr({ width: 1920, height: 1080, category: 'art' })
const mockArtifactDisplayImageUrl = faker.image.urlLoremFlickr({ width: 1920, height: 1080, category: 'art' })
const mockSculptureCloseupImageUrl = faker.image.urlLoremFlickr({ width: 2560, height: 1440, category: 'art' })
const mockGalleryViewImageUrl = faker.image.urlLoremFlickr({ width: 1920, height: 1080, category: 'art' })

const baseMockAssets: Asset[] = [
  {
    id: '1',
    nanoId: 'img1',
    fileName: 'museum-entrance.jpg',
    fileSize: 2048576,
    mimeType: 'image/jpeg',
    type: 'image',
    storagePath: mockMuseumEntranceImageUrl,
    width: 1920,
    height: 1080,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-10T10:00:00Z'),
    updatedAt: new Date('2025-01-10T10:00:00Z'),
  },
  {
    id: '2',
    nanoId: 'img2',
    fileName: 'artifact-display.jpg',
    fileSize: 3145728,
    mimeType: 'image/jpeg',
    type: 'image',
    storagePath: mockArtifactDisplayImageUrl,
    width: 1920,
    height: 1080,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-09T14:30:00Z'),
    updatedAt: new Date('2025-01-09T14:30:00Z'),
  },
  {
    id: '3',
    nanoId: 'img3',
    fileName: 'sculpture-closeup.jpg',
    fileSize: 4194304,
    mimeType: 'image/jpeg',
    type: 'image',
    storagePath: mockSculptureCloseupImageUrl,
    width: 2560,
    height: 1440,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-06T11:00:00Z'),
    updatedAt: new Date('2025-01-06T11:00:00Z'),
  },
  {
    id: '4',
    nanoId: 'img4',
    fileName: 'gallery-view.jpg',
    fileSize: 2500000,
    mimeType: 'image/jpeg',
    type: 'image',
    storagePath: mockGalleryViewImageUrl,
    width: 1920,
    height: 1080,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-05T09:00:00Z'),
    updatedAt: new Date('2025-01-05T09:00:00Z'),
  },
  {
    id: '5',
    nanoId: 'aud1',
    fileName: 'intro-narration-en.mp3',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
    type: 'audio',
    storagePath: 'org/audios/en/aud1-intro.mp3',
    width: null,
    height: null,
    duration: 180,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-08T09:15:00Z'),
    updatedAt: new Date('2025-01-08T09:15:00Z'),
  },
  {
    id: '6',
    nanoId: 'aud2',
    fileName: 'intro-narration-de.mp3',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
    type: 'audio',
    storagePath: 'org/audios/de/aud2-intro.mp3',
    width: null,
    height: null,
    duration: 185,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-08T09:20:00Z'),
    updatedAt: new Date('2025-01-08T09:20:00Z'),
  },
  {
    id: '7',
    nanoId: 'aud3',
    fileName: 'background-music.mp3',
    fileSize: 3145728,
    mimeType: 'audio/mpeg',
    type: 'audio',
    storagePath: 'org/audios/aud3-music.mp3',
    width: null,
    height: null,
    duration: 240,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-07T10:00:00Z'),
    updatedAt: new Date('2025-01-07T10:00:00Z'),
  },
  {
    id: '8',
    nanoId: 'vid1',
    fileName: 'welcome-video-en.mp4',
    fileSize: 52428800,
    mimeType: 'video/mp4',
    type: 'video',
    storagePath: 'org/videos/en/vid1-welcome.mp4',
    width: 1920,
    height: 1080,
    duration: 120,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-07T16:45:00Z'),
    updatedAt: new Date('2025-01-07T16:45:00Z'),
  },
  {
    id: '9',
    nanoId: 'vid2',
    fileName: 'tour-preview-de.mp4',
    fileSize: 45000000,
    mimeType: 'video/mp4',
    type: 'video',
    storagePath: 'org/videos/de/vid2-tour.mp4',
    width: 1920,
    height: 1080,
    duration: 90,
    organizationId: 'org-123',
    uploadedBy: 'user-456',
    createdAt: new Date('2025-01-06T14:00:00Z'),
    updatedAt: new Date('2025-01-06T14:00:00Z'),
  },
]

export const mockAssets: AssetWithUsage[] = baseMockAssets.map((asset) => ({
  ...asset,
  tourCount: 0,
  stopCount: 0,
}))

type MockAssetsProviderProps = {
  children: ReactNode
  assets?: AssetWithUsage[]
  isLoading?: boolean
  error?: Error | null
}

export function MockAssetsProvider({
  children,
  assets = mockAssets,
  isLoading = false,
  error = null,
}: MockAssetsProviderProps) {
  const value: AssetsContextValue = {
    assets,
    isLoading,
    error,
    refetch: () => {},
  }

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
}
