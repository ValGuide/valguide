import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { QueryObserverOptions } from '@tanstack/react-query'
import type {
  StopAssetDraftItem,
  StopDetail,
  StopLocaleDraftResult,
  StopLocalePublishedResult,
} from '@valguide/core/features/tours/types'
import { MockMediaPicker } from '@/features/assets/components/media-picker/mock-media-picker'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import type { DiffResult } from '@/features/editor/hooks/use-diff-view'

import { MockStopEditorProvider } from '@/features/stops/contexts/mock-stop-editor-provider'
import { StopEditPage } from './stop-edit-page'

const createMockDiffQueryOptions = (diffResult: DiffResult): QueryObserverOptions<DiffResult> => ({
  queryKey: ['mock-diff', diffResult.hasChanges, diffResult.changedFields.length],
  queryFn: () => Promise.resolve(diffResult),
  staleTime: Number.POSITIVE_INFINITY,
})

const noDiffResult: DiffResult = {
  hasChanges: false,
  changedFields: [],
  fieldDiffs: [],
  publishedAt: new Date('2025-01-10T10:00:00Z'),
}

const withChangesDiffResult: DiffResult = {
  hasChanges: true,
  changedFields: ['title', 'description'],
  fieldDiffs: [
    {
      field: 'title',
      draft: 'The Starry Night - Updated',
      published: 'The Starry Night',
      hasChanged: true,
    },
    {
      field: 'description',
      draft: 'Updated description with new information.',
      published: 'Vincent van Gogh painted this masterpiece in June 1889.',
      hasChanged: true,
    },
  ],
  publishedAt: new Date('2025-01-10T10:00:00Z'),
}

const createMockStopDetail = (overrides: Partial<StopDetail> = {}): StopDetail => ({
  id: 'stop-1',
  nanoId: 'stop1abc',
  organizationId: 'org-1',
  existingLocales: ['en', 'de'],
  availableLocales: ['en', 'de'],
  archivedAt: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  locales: [],
  settings: null,
  ...overrides,
})

const createMockLocaleDraft = (overrides: Partial<StopLocaleDraftResult> = {}): StopLocaleDraftResult => ({
  locale: 'en',
  title: 'The Starry Night',
  description: 'Vincent van Gogh painted this masterpiece in June 1889.',
  transcription: 'Welcome to our audio guide for The Starry Night...',
  hasPublished: false,
  ...overrides,
})

const createMockLocalePublished = (overrides: Partial<StopLocalePublishedResult> = {}): StopLocalePublishedResult => ({
  locale: 'en',
  title: 'The Starry Night',
  description: 'Vincent van Gogh painted this masterpiece in June 1889.',
  transcription: 'Welcome to our audio guide for The Starry Night...',
  publishedAt: new Date('2025-01-10T10:00:00Z'),
  ...overrides,
})

const createMockAssets = (count: number): StopAssetDraftItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `asset-item-${i + 1}`,
    asset: {
      id: `asset-${i + 1}`,
      nanoId: `asset${i + 1}nano`,
      type: 'image' as const,
      fileName: `image-${i + 1}.jpg`,
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      storagePath: '',
      publicUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: 'art' }),
      width: 800,
      height: 600,
      duration: null,
      organizationId: 'org-1',
      uploadedBy: 'user-1',
      createdAt: new Date('2025-01-10T10:00:00Z'),
      updatedAt: new Date('2025-01-10T10:00:00Z'),
    },
    channel: 'images.gallery',
    position: i,
    locale: null,
    createdAt: new Date('2025-01-10T10:00:00Z'),
  }))

const meta: Meta<typeof StopEditPage> = {
  title: 'Studio/Pages/Stops/Edit/StopEditPage',
  component: StopEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft()}
          localePublished={null}
          assets={[]}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
  args: {
    MediaPicker: MockMediaPicker,
    onPublishAssets: async () => {},
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Unpublished: Story = {
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft()}
          localePublished={null}
          assets={createMockAssets(2)}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}

export const Published: Story = {
  args: {
    diffQueryOptions: createMockDiffQueryOptions(noDiffResult),
  },
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft({ hasPublished: true })}
          localePublished={createMockLocalePublished()}
          assets={createMockAssets(3)}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}

export const WithUnpublishedChanges: Story = {
  args: {
    diffQueryOptions: createMockDiffQueryOptions(withChangesDiffResult),
  },
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft({
            hasPublished: true,
            title: 'The Starry Night - Updated',
            description: 'Updated description with new information.',
          })}
          localePublished={createMockLocalePublished()}
          assets={createMockAssets(2)}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}

export const WithGalleryImages: Story = {
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft()}
          localePublished={null}
          assets={createMockAssets(6)}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}

export const EmptyStop: Story = {
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft({ title: '', description: '', transcription: '' })}
          localePublished={null}
          assets={[]}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}

export const MultipleLocales: Story = {
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail({
            existingLocales: ['en', 'de', 'fr', 'it'],
            availableLocales: ['en', 'de', 'fr', 'it'],
          })}
          localeDraft={createMockLocaleDraft()}
          localePublished={null}
          assets={createMockAssets(2)}
          navigation={{
            backPath: '/tours/abc123xyz/edit',
            backLabel: 'Art Museum Tour',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}

export const StandaloneStop: Story = {
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={createMockStopDetail()}
          localeDraft={createMockLocaleDraft()}
          localePublished={null}
          assets={createMockAssets(2)}
          navigation={{ backPath: '/stops', backLabel: 'All Stops' }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}
