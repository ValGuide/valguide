import type { Meta, StoryObj } from '@storybook/react'
import type { StructureDraftStop } from '@valguide/core/features/tours/structure/get-structure-draft.fn'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import type { TourLocaleDraftResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-draft.fn'
import { MockTourEditorProvider } from '@/features/tours/contexts/mock-tour-editor-provider'
import { TourProgress } from './tour-progress'

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
  coverImage: null,
  ...overrides,
})

const createMockLocaleDraft = (overrides: Partial<TourLocaleDraftResult> = {}): TourLocaleDraftResult => ({
  locale: 'en',
  title: null,
  description: null,
  hasPublished: false,
  ...overrides,
})

const createMockStops = (count: number): StructureDraftStop[] =>
  Array.from({ length: count }, (_, i) => ({
    stopId: `stop-${i + 1}`,
    stopNanoId: `stop${i + 1}nano`,
    position: i,
    visible: true,
    title: i === 0 ? null : `Stop ${i + 1}`,
    locale: 'en',
    thumbnailUrl: null,
  }))

const meta: Meta<typeof TourProgress> = {
  title: 'Studio/Tours/TourProgress',
  component: TourProgress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider tourDetail={createMockTourDetail()} localeDraft={createMockLocaleDraft()} stops={[]}>
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const TitleOnly: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour' })}
        stops={[]}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const TitleAndDescription: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour', description: 'An amazing tour to explore' })}
        stops={[]}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const WithCoverImage: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour', description: 'An amazing tour to explore' })}
        stops={[]}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const WithStopsButNoTitles: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour', description: 'An amazing tour to explore' })}
        stops={createMockStops(1)}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const Complete: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour', description: 'An amazing tour to explore' })}
        stops={createMockStops(2).map((stop, i) => ({ ...stop, title: `Stop ${i + 1}` }))}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const WithUnpublishedTourDraft: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({
          title: 'My Tour - Updated',
          description: 'An amazing tour to explore - with changes',
        })}
        stops={createMockStops(1).map((stop) => ({ ...stop, title: 'Stop 1' }))}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const WithUnpublishedStopDrafts: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour', description: 'An amazing tour to explore' })}
        stops={createMockStops(2).map((stop, i) => ({ ...stop, title: `Stop ${i + 1}` }))}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const AllPublished: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Tour', description: 'An amazing tour to explore' })}
        stops={createMockStops(1).map((stop) => ({ ...stop, title: 'Stop 1' }))}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}
