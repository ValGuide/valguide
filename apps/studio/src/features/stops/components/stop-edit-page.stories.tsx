import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { StopAssetDraftItem } from '@valguide/core/features/guides/stop/asset/get-stop-assets-draft.fn'
import type { StopDetail } from '@valguide/core/features/guides/stop/get-stop-detail.fn'
import type { StopLocaleDraftResult } from '@valguide/core/features/guides/stop/locale/get-stop-locale-draft.fn'
import type { StopLocalePublishedResult } from '@valguide/core/features/guides/stop/locale/get-stop-locale-published.fn'
import { MockMediaPicker } from '@/features/assets/components/media-picker/mock-media-picker'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import { MockStopEditorProvider } from '@/features/stops/contexts/mock-stop-editor-provider'
import { StopEditPage } from './stop-edit-page'

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
  revision: 1,
  publishedVersionId: null,
  hasUnpublishedChanges: false,
  ...overrides,
})

const createMockLocalePublished = (overrides: Partial<StopLocalePublishedResult> = {}): StopLocalePublishedResult => ({
  locale: 'en',
  title: 'The Starry Night',
  description: 'Vincent van Gogh painted this masterpiece in June 1889.',
  transcription: 'Welcome to our audio guide for The Starry Night...',
  version: 1,
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
      storagePath: `assets/image-${i + 1}.jpg`,
      publicUrl: faker.image.url({ width: 800, height: 600 }),
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

/** Story-only context data, not component props */
type StoryContextData = {
  stopDetail?: StopDetail
  localeDraft?: StopLocaleDraftResult | null
  localePublished?: StopLocalePublishedResult | null
  assets?: StopAssetDraftItem[]
}

const meta = {
  title: 'Studio/Pages/Stops/Edit/StopEditPage',
  component: StopEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      const storyContext = context.args as StoryContextData
      const { stopDetail, localeDraft, localePublished, assets } = storyContext
      return (
        <MockAssetsProvider>
          <MockStopEditorProvider
            stopDetail={stopDetail ?? createMockStopDetail()}
            localeDraft={localeDraft ?? createMockLocaleDraft()}
            localePublished={localePublished ?? null}
            assets={assets ?? []}
            navigation={{
              backPath: '/guides/abc123xyz/edit',
              backLabel: 'Art Museum Guide',
              backParams: { nanoId: 'abc123xyz' },
            }}
          >
            <Story />
          </MockStopEditorProvider>
        </MockAssetsProvider>
      )
    },
  ],
  args: {
    MediaPicker: MockMediaPicker,
    onPublishAssets: async () => {},
  },
} as Meta<typeof StopEditPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
  } as StoryContextData,
}

export const Unpublished: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(2),
  } as StoryContextData,
}

export const Published: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft({ publishedVersionId: 'sv-pub-1', hasUnpublishedChanges: false }),
    localePublished: createMockLocalePublished(),
    assets: createMockAssets(3),
  } as StoryContextData,
}

export const WithUnpublishedChanges: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft({
      publishedVersionId: 'sv-pub-1',
      hasUnpublishedChanges: true,
      title: 'The Starry Night - Updated',
      description: 'Updated description with new information.',
    }),
    localePublished: createMockLocalePublished(),
    assets: createMockAssets(2),
  } as StoryContextData,
}

export const WithGalleryImages: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(6),
  } as StoryContextData,
}

export const EmptyStop: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft({ title: '', description: '', transcription: '' }),
    assets: [],
  } as StoryContextData,
}

export const MultipleLocales: Story = {
  args: {
    stopDetail: createMockStopDetail({
      existingLocales: ['en', 'de', 'fr', 'it'],
      availableLocales: ['en', 'de', 'fr', 'it'],
    }),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(2),
  } as StoryContextData,
}

export const StandaloneStop: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(2),
  } as StoryContextData,
  decorators: [
    (Story, context) => {
      const storyContext = context.args as StoryContextData
      const { stopDetail, localeDraft, localePublished, assets } = storyContext
      return (
        <MockAssetsProvider>
          <MockStopEditorProvider
            stopDetail={stopDetail ?? createMockStopDetail()}
            localeDraft={localeDraft ?? createMockLocaleDraft()}
            localePublished={localePublished ?? null}
            assets={assets ?? []}
            navigation={{ backPath: '/stops', backLabel: 'All Stops' }}
          >
            <Story />
          </MockStopEditorProvider>
        </MockAssetsProvider>
      )
    },
  ],
}
