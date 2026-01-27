import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { StopDetail } from '@valguide/core/features/guides/stop/get-stop-detail.fn'
import type { StopLocaleDraftResult } from '@valguide/core/features/guides/stop/locale/get-stop-locale-draft.fn'
import type { StopLocalePublishedResult } from '@valguide/core/features/guides/stop/locale/get-stop-locale-published.fn'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import { MockStopEditorProvider } from '@/features/stops/contexts/mock-stop-editor-provider'
import { StopEditPage } from './stop-edit-page'

const createMockStopDetail = (overrides: Partial<StopDetail> = {}): StopDetail => ({
  id: 'stop-1',
  nanoId: 'stop1abc',
  organizationId: 'org-1',
  availableLocales: ['en', 'de'],
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  ...overrides,
})

const createMockLocaleDraft = (overrides: Partial<StopLocaleDraftResult> = {}): StopLocaleDraftResult => ({
  id: 'sv1',
  title: 'The Starry Night',
  description: 'Vincent van Gogh painted this masterpiece in June 1889.',
  transcription: 'Welcome to our audio guide for The Starry Night...',
  publishedVersionId: null,
  hasUnpublishedChanges: false,
  ...overrides,
})

const createMockLocalePublished = (overrides: Partial<StopLocalePublishedResult> = {}): StopLocalePublishedResult => ({
  id: 'sv-pub-1',
  title: 'The Starry Night',
  description: 'Vincent van Gogh painted this masterpiece in June 1889.',
  transcription: 'Welcome to our audio guide for The Starry Night...',
  ...overrides,
})

const createMockAssets = (count: number): AssetWithRole[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `asset-${i + 1}`,
    nanoId: `asset${i + 1}nano`,
    type: 'image/jpeg',
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
    role: 'image',
    order: i,
    locale: null,
  }))

type StoryArgs = {
  stopDetail?: StopDetail
  localeDraft?: StopLocaleDraftResult | null
  localePublished?: StopLocalePublishedResult | null
  assets?: AssetWithRole[]
}

const meta = {
  title: 'Studio/Pages/Stops/Edit/StopEditPage',
  component: StopEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, { args }) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={args.stopDetail ?? createMockStopDetail()}
          localeDraft={args.localeDraft ?? createMockLocaleDraft()}
          localePublished={args.localePublished ?? null}
          assets={args.assets ?? []}
          navigation={{
            backPath: '/guides/abc123xyz/edit',
            backLabel: 'Art Museum Guide',
            backParams: { nanoId: 'abc123xyz' },
          }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
} satisfies Meta<typeof StopEditPage & StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
  },
}

export const Unpublished: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(2),
  },
}

export const Published: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft({ publishedVersionId: 'sv-pub-1', hasUnpublishedChanges: false }),
    localePublished: createMockLocalePublished(),
    assets: createMockAssets(3),
  },
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
  },
}

export const WithGalleryImages: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(6),
  },
}

export const EmptyStop: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft({ title: '', description: '', transcription: '' }),
    assets: [],
  },
}

export const MultipleLocales: Story = {
  args: {
    stopDetail: createMockStopDetail({ availableLocales: ['en', 'de', 'fr', 'it'] }),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(2),
  },
}

export const StandaloneStop: Story = {
  args: {
    stopDetail: createMockStopDetail(),
    localeDraft: createMockLocaleDraft(),
    assets: createMockAssets(2),
  },
  decorators: [
    (Story, { args }) => (
      <MockAssetsProvider>
        <MockStopEditorProvider
          stopDetail={args.stopDetail ?? createMockStopDetail()}
          localeDraft={args.localeDraft ?? createMockLocaleDraft()}
          localePublished={args.localePublished ?? null}
          assets={args.assets ?? []}
          navigation={{ backPath: '/stops', backLabel: 'All Stops' }}
        >
          <Story />
        </MockStopEditorProvider>
      </MockAssetsProvider>
    ),
  ],
}
