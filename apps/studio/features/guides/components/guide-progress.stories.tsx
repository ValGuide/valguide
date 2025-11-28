// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import { GuideProgress } from './guide-progress'

const meta: Meta<typeof GuideProgress> = {
  title: 'Guides/GuideProgress',
  component: GuideProgress,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof GuideProgress>

const baseGuide: GuideWithStops = {
  id: 'guide-1',
  nanoId: 'abc123',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-1',
  updatedBy: 'user-1',
  published: null,
  coverImage: null,
  organizationId: 'org-1',
  translations: [],
  stops: [],
}

export const Empty: Story = {
  args: {
    guide: baseGuide,
    locale: 'en',
  },
}

export const TitleOnly: Story = {
  args: {
    guide: {
      ...baseGuide,
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          title: 'My Guide',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    locale: 'en',
  },
}

export const TitleAndDescription: Story = {
  args: {
    guide: {
      ...baseGuide,
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          title: 'My Guide',
          description: 'An amazing guide to explore',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    locale: 'en',
  },
}

export const WithCoverImage: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: 'asset-1',
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          title: 'My Guide',
          description: 'An amazing guide to explore',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    locale: 'en',
  },
}

export const WithStopsButNoTitles: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: 'asset-1',
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          title: 'My Guide',
          description: 'An amazing guide to explore',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      stops: [
        {
          id: 'stop-1',
          guideId: 'guide-1',
          nanoId: 'stop1',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          translations: [],
        },
      ],
    },
    locale: 'en',
  },
}

export const Complete: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: 'asset-1',
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          title: 'My Guide',
          description: 'An amazing guide to explore',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      stops: [
        {
          id: 'stop-1',
          guideId: 'guide-1',
          nanoId: 'stop1',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          translations: [
            {
              id: 'stop-trans-1',
              stopId: 'stop-1',
              locale: 'en',
              title: 'Stop 1',
              description: 'First stop',
              transcription: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        {
          id: 'stop-2',
          guideId: 'guide-1',
          nanoId: 'stop2',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          translations: [
            {
              id: 'stop-trans-2',
              stopId: 'stop-2',
              locale: 'en',
              title: 'Stop 2',
              description: 'Second stop',
              transcription: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    },
    locale: 'en',
  },
}
