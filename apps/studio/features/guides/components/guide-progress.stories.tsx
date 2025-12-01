// @ts-nocheck
import { faker } from '@faker-js/faker'
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
  archivedAt: null,
  deletedAt: null,
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
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: null,
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
              currentVersionId: 'sv1',
              draftVersionId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              currentVersion: {
                id: 'sv1',
                translationId: 'stop-trans-1',
                version: 1,
                status: 'published',
                title: 'Stop 1',
                description: 'First stop',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: new Date(),
              },
              draftVersion: null,
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
              currentVersionId: 'sv2',
              draftVersionId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              currentVersion: {
                id: 'sv2',
                translationId: 'stop-trans-2',
                version: 1,
                status: 'published',
                title: 'Stop 2',
                description: 'Second stop',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: new Date(),
              },
              draftVersion: null,
            },
          ],
        },
      ],
    },
    locale: 'en',
  },
}

export const WithUnpublishedGuideDraft: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: 'v1',
          draftVersionId: 'v2',
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: {
            id: 'v2',
            translationId: 'trans-1',
            version: 2,
            status: 'draft',
            title: 'My Guide - Updated',
            description: 'An amazing guide to explore - with changes',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: null,
          },
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
              currentVersionId: 'sv1',
              draftVersionId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              currentVersion: {
                id: 'sv1',
                translationId: 'stop-trans-1',
                version: 1,
                status: 'published',
                title: 'Stop 1',
                description: 'First stop',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: new Date(),
              },
              draftVersion: null,
            },
          ],
        },
      ],
    },
    locale: 'en',
  },
}

export const WithUnpublishedStopDrafts: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
              currentVersionId: 'sv1',
              draftVersionId: 'sv2',
              createdAt: new Date(),
              updatedAt: new Date(),
              currentVersion: {
                id: 'sv1',
                translationId: 'stop-trans-1',
                version: 1,
                status: 'published',
                title: 'Stop 1',
                description: 'First stop',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: new Date(),
              },
              draftVersion: {
                id: 'sv2',
                translationId: 'stop-trans-1',
                version: 2,
                status: 'draft',
                title: 'Stop 1 - Updated',
                description: 'First stop with changes',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: null,
              },
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
              currentVersionId: 'sv3',
              draftVersionId: 'sv4',
              createdAt: new Date(),
              updatedAt: new Date(),
              currentVersion: {
                id: 'sv3',
                translationId: 'stop-trans-2',
                version: 1,
                status: 'published',
                title: 'Stop 2',
                description: 'Second stop',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: new Date(),
              },
              draftVersion: {
                id: 'sv4',
                translationId: 'stop-trans-2',
                version: 2,
                status: 'draft',
                title: 'Stop 2 - Updated',
                description: 'Second stop with changes',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: null,
              },
            },
          ],
        },
      ],
    },
    locale: 'en',
  },
}

export const AllPublished: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
      translations: [
        {
          id: 'trans-1',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: 'v1',
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: {
            id: 'v1',
            translationId: 'trans-1',
            version: 1,
            status: 'published',
            title: 'My Guide',
            description: 'An amazing guide to explore',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: new Date(),
          },
          draftVersion: null,
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
              currentVersionId: 'sv1',
              draftVersionId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              currentVersion: {
                id: 'sv1',
                translationId: 'stop-trans-1',
                version: 1,
                status: 'published',
                title: 'Stop 1',
                description: 'First stop',
                transcription: null,
                createdAt: new Date(),
                createdBy: 'user-1',
                publishedAt: new Date(),
              },
              draftVersion: null,
            },
          ],
        },
      ],
    },
    locale: 'en',
  },
}
