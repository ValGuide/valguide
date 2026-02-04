import type { Meta, StoryObj } from '@storybook/react'
import type { QueryObserverOptions } from '@tanstack/react-query'
import type {
  StructureDraftStop,
  TourDetail,
  TourLocaleDraftResult,
  TourLocalePublishedResult,
} from '@valguide/core/features/tours/types'
import { fn } from 'storybook/test'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import type { MediaPickerComponentProps } from '@/features/assets/components/media-picker/types'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import type { DiffResult } from '@/features/editor/hooks/use-diff-view'

import { MockTourEditorProvider } from '@/features/tours/contexts/mock-tour-editor-provider'
import { TourEditPage, type TourEditPageProps } from './tour-edit-page'

const createMockDiffQueryOptions = (diffResult: DiffResult): QueryObserverOptions<DiffResult> => ({
  queryKey: ['mock-diff'],
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
      draft: 'City Art Museum Audio Tour - Updated',
      published: 'City Art Museum Audio Tour',
      hasChanged: true,
    },
    {
      field: 'description',
      draft: 'New description with updates.',
      published:
        'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio tour.',
      hasChanged: true,
    },
  ],
  publishedAt: new Date('2025-01-10T10:00:00Z'),
}

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

const createMockTourDetail = (overrides: Partial<TourDetail> = {}): TourDetail => ({
  id: 'tour-1',
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

const createMockLocaleDraft = (overrides: Partial<TourLocaleDraftResult> = {}): TourLocaleDraftResult => ({
  locale: 'en',
  title: 'City Art Museum Audio Tour',
  description:
    'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio tour.',
  hasPublished: false,
  ...overrides,
})

const createMockLocalePublished = (overrides: Partial<TourLocalePublishedResult> = {}): TourLocalePublishedResult => ({
  locale: 'en',
  title: 'City Art Museum Audio Tour',
  description:
    'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio tour.',
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
    thumbnailUrl: null,
  }))

/** Story-only context data, not component props */
type StoryContextData = {
  tourDetail?: TourDetail
  localeDraft?: TourLocaleDraftResult | null
  localePublished?: TourLocalePublishedResult | null
  stops?: StructureDraftStop[]
}

const meta = {
  title: 'Studio/Pages/Tours/Edit/TourEditPage',
  component: TourEditPage,
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
      const storyContext = context.args as TourEditPageProps & StoryContextData
      const { tourDetail, localeDraft, localePublished, stops } = storyContext
      return (
        <MockAssetsProvider>
          <MockTourEditorProvider
            tourDetail={tourDetail ?? createMockTourDetail()}
            localeDraft={localeDraft ?? createMockLocaleDraft()}
            localePublished={localePublished ?? null}
            stops={stops ?? createMockStops(3)}
          >
            <Story />
          </MockTourEditorProvider>
        </MockAssetsProvider>
      )
    },
  ],
} as Meta<typeof TourEditPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    tourDetail: createMockTourDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(3),
  } as TourEditPageProps & StoryContextData,
}

export const Unpublished: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    tourDetail: createMockTourDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(2),
  } as TourEditPageProps & StoryContextData,
}

export const Published: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    diffQueryOptions: createMockDiffQueryOptions(noDiffResult),
    tourDetail: createMockTourDetail(),
    localeDraft: createMockLocaleDraft({ hasPublished: true }),
    localePublished: createMockLocalePublished(),
    stops: createMockStops(3),
  } as TourEditPageProps & StoryContextData,
}

export const WithUnpublishedChanges: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    diffQueryOptions: createMockDiffQueryOptions(withChangesDiffResult),
    tourDetail: createMockTourDetail(),
    localeDraft: createMockLocaleDraft({
      hasPublished: true,
      title: 'City Art Museum Audio Tour - Updated',
      description: 'New description with updates.',
    }),
    localePublished: createMockLocalePublished(),
    stops: createMockStops(3),
  } as TourEditPageProps & StoryContextData,
}

export const EmptyTour: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    tourDetail: createMockTourDetail(),
    localeDraft: createMockLocaleDraft({ title: '', description: '' }),
    stops: [],
  } as TourEditPageProps & StoryContextData,
}

export const ManyStops: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    tourDetail: createMockTourDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(10),
  } as TourEditPageProps & StoryContextData,
}

export const MultipleLocales: Story = {
  args: {
    onPublish: fn(),
    onUnpublish: fn(),
    onHideStop: fn(),
    onShowStop: fn(),
    MediaPicker: StoryMediaPicker,
    tourDetail: createMockTourDetail({ availableLocales: ['en', 'de', 'fr', 'it'] }),
    localeDraft: createMockLocaleDraft(),
    stops: createMockStops(3),
  } as TourEditPageProps & StoryContextData,
}
