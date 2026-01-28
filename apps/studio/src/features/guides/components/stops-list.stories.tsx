import type { Meta, StoryObj } from '@storybook/react'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft.fn'
import { fn } from 'storybook/test'
import { MockGuideEditorProvider } from '@/features/guides/contexts/mock-guide-editor-provider'
import { StopsList } from './stops-list'

const createMockGuideDetail = (overrides: Partial<GuideDetail> = {}): GuideDetail => ({
  id: 'guide-1',
  nanoId: 'abc123xyz',
  organizationId: 'org-1',
  availableLocales: ['en', 'de', 'rm'],
  archivedAt: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  locales: [],
  settings: null,
  ...overrides,
})

const createMockStops = (count: number): StructureDraftStop[] =>
  Array.from({ length: count }, (_, i) => ({
    stopId: `stop-${i + 1}`,
    stopNanoId: `stop${i + 1}nano`,
    position: i,
    visible: true,
    title: `Stop ${i + 1}: ${['Gallery', 'Exhibition', 'Courtyard', 'Hall', 'Room'][i % 5]}`,
    locale: 'en',
    thumbnailUrl: null,
  }))

/** Story-only context data, not component props */
type StoryContextData = {
  guideDetail?: GuideDetail
  stops?: StructureDraftStop[]
}

const meta: Meta<typeof StopsList> = {
  title: 'Studio/Guides/StopsList',
  component: StopsList,
  parameters: {
    layout: 'padded',
  },
  args: {
    onReorder: fn(),
    onEdit: fn(),
    onHide: fn(),
    onShow: fn(),
    onRemove: fn(),
    onAdd: fn(),
  },
  decorators: [
    (Story, context) => {
      const storyContext = context.args as StoryContextData
      const { guideDetail, stops } = storyContext
      return (
        <MockGuideEditorProvider guideDetail={guideDetail ?? createMockGuideDetail()} stops={stops ?? []}>
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
    stops: [],
  },
}

export const SingleStop: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    stops: createMockStops(1),
  },
}

export const MultipleStops: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    stops: createMockStops(3),
  },
}

export const ManyStops: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    stops: createMockStops(15),
  },
}

export const HiddenStop: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    stops: createMockStops(3).map((stop, i) => ({
      ...stop,
      visible: i === 1 ? false : true,
    })),
  },
}

export const UntitledStop: Story = {
  args: {
    guideDetail: createMockGuideDetail(),
    stops: createMockStops(2).map((stop) => ({
      ...stop,
      title: undefined,
    })),
  },
}
