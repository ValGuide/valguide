import type { Meta, StoryObj } from '@storybook/react'
import type { StructureDraftStop, TourDetail } from '@valguide/core/features/tours/types'
import { fn } from 'storybook/test'
import { MockTourEditorProvider } from '@/features/tours/contexts/mock-tour-editor-provider'
import { StopsList } from './stops-list'

const createMockTourDetail = (overrides: Partial<TourDetail> = {}): TourDetail => ({
  id: 'tour-1',
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

const meta: Meta<typeof StopsList> = {
  title: 'Studio/Tours/StopsList',
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
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider tourDetail={createMockTourDetail()} stops={[]}>
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const SingleStop: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider tourDetail={createMockTourDetail()} stops={createMockStops(1)}>
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const MultipleStops: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider tourDetail={createMockTourDetail()} stops={createMockStops(3)}>
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const ManyStops: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider tourDetail={createMockTourDetail()} stops={createMockStops(15)}>
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const HiddenStop: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        stops={createMockStops(3).map((stop, i) => ({
          ...stop,
          visible: i === 1 ? false : true,
        }))}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}

export const UntitledStop: Story = {
  decorators: [
    (Story) => (
      <MockTourEditorProvider
        tourDetail={createMockTourDetail()}
        stops={createMockStops(2).map((stop) => ({
          ...stop,
          title: null,
        }))}
      >
        <Story />
      </MockTourEditorProvider>
    ),
  ],
}
