import type { Meta, StoryObj } from '@storybook/react'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import type { GuideLocalePublishedResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-published.fn'
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft.fn'
import { fn } from 'storybook/test'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import type { MediaPickerComponentProps } from '@/features/assets/components/media-picker/types'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import { MockGuideEditorProvider } from '@/features/guides/contexts/mock-guide-editor-provider'
import { GuideEditPage } from './guide-edit-page'

const mockOnUpload = async (_file: File, onProgress: (p: number) => void) => {
  for (let i = 0; i <= 100; i += 20) {
    await new Promise((r) => setTimeout(r, 100))
    onProgress(i)
  }
  return null
}

function StoryMediaPicker(props: MediaPickerComponentProps) {
  return (
    <MediaPicker {...props} onUpload={mockOnUpload} onBrowseLibrary={() => console.log('Browse library clicked')} />
  )
}

const createMockGuideDetail = (overrides: Partial<GuideDetail> = {}): GuideDetail => ({
  id: 'guide-1',
  nanoId: 'abc123xyz',
  organizationId: 'org-1',
  availableLocales: ['en', 'de'],
  archivedAt: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  locales: [],
  settings: null,
  ...overrides,
})

const createMockLocaleDraft = (overrides: Partial<GuideLocaleDraftResult> = {}): GuideLocaleDraftResult => ({
  locale: 'en',
  title: 'City Art Museum Audio Tour',
  description:
    'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
  revision: 1,
  publishedVersionId: null,
  hasUnpublishedChanges: false,
  ...overrides,
})

const createMockLocalePublished = (
  overrides: Partial<GuideLocalePublishedResult> = {},
): GuideLocalePublishedResult => ({
  locale: 'en',
  title: 'City Art Museum Audio Tour',
  description:
    'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
  version: 1,
  publishedAt: new Date('2025-01-10T10:00:00Z'),
  ...overrides,
})

const createMockStops = (count: number): StructureDraftStop[] =>
  Array.from({ length: count }, (_, i) => ({
    stopId: `stop-${i + 1}`,
    stopNanoId: `stop${i + 1}nano`,
    position: i,
    visible: true,
    title: `Stop ${i + 1}: ${['Gallery', 'Exhibition', 'Courtyard', 'Hall', 'Room'][i % 5]} ${Math.floor(i / 5) + 1}`,
    locale: 'en',
  }))

type StoryArgs = {
  guideDetail?: GuideDetail
  localeDraft?: GuideLocaleDraftResult | null
  localePublished?: GuideLocalePublishedResult | null
  stops?: StructureDraftStop[]
}

const meta = {
  title: 'Studio/Pages/Guides/Edit/GuideEditPage',
  component: GuideEditPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
  },
  decorators: [
    (Story, context) => {
      const { guideDetail, localeDraft, localePublished, stops } = context.args as StoryArgs
      return (
        <MockAssetsProvider>
          <MockGuideEditorProvider
            guideDetail={guideDetail ?? createMockGuideDetail()}
            localeDraft={localeDraft ?? createMockLocaleDraft()}
            localePublished={localePublished ?? null}
            stops={stops ?? createMockStops(3)}
          >
            <Story />
          </MockGuideEditorProvider>
        </MockAssetsProvider>
      )
    },
  ],
} satisfies Meta<typeof GuideEditPage & StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(3),
  } as any,
}

export const Unpublished: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(2),
  } as any,
}

export const Published: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({ publishedVersionId: 'gv-pub-1', hasUnpublishedChanges: false }),
    localePublished: createMockLocalePublished(),
    stops: createMockStops(3),
  } as any,
}

export const WithUnpublishedChanges: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      publishedVersionId: 'gv-pub-1',
      hasUnpublishedChanges: true,
      title: 'City Art Museum Audio Tour - Updated',
      description: 'New description with updates.',
    }),
    localePublished: createMockLocalePublished(),
    stops: createMockStops(3),
  } as any,
}

export const EmptyGuide: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({ title: '', description: '' }),
    stops: [],
  } as any,
}

export const ManyStops: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(10),
  } as any,
}

export const MultipleLocales: Story = {
  args: {
    guideDetail: createMockGuideDetail({ availableLocales: ['en', 'de', 'fr', 'it'] }),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(3),
  } as any,
}
