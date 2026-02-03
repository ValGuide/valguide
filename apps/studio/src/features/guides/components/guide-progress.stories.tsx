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

const meta: Meta<typeof GuideProgress> = {
  title: 'Studio/Guides/GuideProgress',
  component: GuideProgress,
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
      <MockGuideEditorProvider guideDetail={createMockGuideDetail()} localeDraft={createMockLocaleDraft()} stops={[]}>
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const TitleOnly: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide' })}
        stops={[]}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const TitleAndDescription: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide', description: 'An amazing guide to explore' })}
        stops={[]}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const WithCoverImage: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide', description: 'An amazing guide to explore' })}
        stops={[]}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const WithStopsButNoTitles: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide', description: 'An amazing guide to explore' })}
        stops={createMockStops(1)}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const Complete: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide', description: 'An amazing guide to explore' })}
        stops={createMockStops(2).map((stop, i) => ({ ...stop, title: `Stop ${i + 1}` }))}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const WithUnpublishedGuideDraft: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({
          title: 'My Guide - Updated',
          description: 'An amazing guide to explore - with changes',
        })}
        stops={createMockStops(1).map((stop) => ({ ...stop, title: 'Stop 1' }))}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const WithUnpublishedStopDrafts: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide', description: 'An amazing guide to explore' })}
        stops={createMockStops(2).map((stop, i) => ({ ...stop, title: `Stop ${i + 1}` }))}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}

export const AllPublished: Story = {
  decorators: [
    (Story) => (
      <MockGuideEditorProvider
        guideDetail={createMockGuideDetail()}
        localeDraft={createMockLocaleDraft({ title: 'My Guide', description: 'An amazing guide to explore' })}
        stops={createMockStops(1).map((stop) => ({ ...stop, title: 'Stop 1' }))}
      >
        <Story />
      </MockGuideEditorProvider>
    ),
  ],
}
