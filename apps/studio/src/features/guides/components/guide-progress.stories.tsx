import type { Meta, StoryObj } from '@storybook/react'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft.fn'
import { MockGuideEditorProvider } from '@/features/guides/contexts/mock-guide-editor-provider'
import { GuideProgress } from './guide-progress'

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
  title: undefined,
  description: undefined,
  revision: 1,
  publishedVersionId: null,
  hasUnpublishedChanges: false,
  ...overrides,
})

const createMockStops = (count: number): StructureDraftStop[] =>
  Array.from({ length: count }, (_, i) => ({
    stopId: `stop-${i + 1}`,
    stopNanoId: `stop${i + 1}nano`,
    position: i,
    visible: true,
    title: i === 0 ? undefined : `Stop ${i + 1}`,
    locale: 'en',
    thumbnailUrl: null,
  }))

/** Story-only context data, not component props */
type StoryContextData = {
  guideDetail?: GuideDetail
  localeDraft?: GuideLocaleDraftResult | null
  stops?: StructureDraftStop[]
}

const meta: Meta<typeof GuideProgress> = {
  title: 'Studio/Guides/GuideProgress',
  component: GuideProgress,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => {
      const storyContext = context.args as StoryContextData
      const { guideDetail, localeDraft, stops } = storyContext
      return (
        <MockGuideEditorProvider
          guideDetail={guideDetail ?? createMockGuideDetail()}
          localeDraft={localeDraft ?? createMockLocaleDraft()}
          stops={stops ?? []}
        >
          <Story />
        </MockGuideEditorProvider>
      )
    },
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft(),
    stops: [],
  },
}

export const TitleOnly: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({ title: 'My Guide' }),
    stops: [],
  },
}

export const TitleAndDescription: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide',
      description: 'An amazing guide to explore',
    }),
    stops: [],
  },
}

export const WithCoverImage: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide',
      description: 'An amazing guide to explore',
    }),
    stops: [],
  },
}

export const WithStopsButNoTitles: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide',
      description: 'An amazing guide to explore',
    }),
    stops: createMockStops(1),
  },
}

export const Complete: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide',
      description: 'An amazing guide to explore',
    }),
    stops: createMockStops(2).map((stop, i) => ({
      ...stop,
      title: `Stop ${i + 1}`,
    })),
  },
}

export const WithUnpublishedGuideDraft: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide - Updated',
      description: 'An amazing guide to explore - with changes',
    }),
    stops: createMockStops(1).map((stop) => ({
      ...stop,
      title: 'Stop 1',
    })),
  },
}

export const WithUnpublishedStopDrafts: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide',
      description: 'An amazing guide to explore',
    }),
    stops: createMockStops(2).map((stop, i) => ({
      ...stop,
      title: `Stop ${i + 1}`,
    })),
  },
}

export const AllPublished: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    localeDraft: createMockLocaleDraft({
      title: 'My Guide',
      description: 'An amazing guide to explore',
    }),
    stops: createMockStops(1).map((stop) => ({
      ...stop,
      title: 'Stop 1',
    })),
  },
}
