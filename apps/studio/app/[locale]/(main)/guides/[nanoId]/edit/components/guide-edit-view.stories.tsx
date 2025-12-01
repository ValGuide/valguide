// @ts-nocheck - Storybook types only available in storybook package
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideWithStops, StopWithTranslations } from '@valguide/core/features/guides/schema'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { GuideEditView } from './guide-edit-view'

const mockStops: StopWithTranslations[] = [
  {
    id: 'stop-1',
    guideId: 'guide-1',
    nanoId: 'stop1abc',
    organizationId: 'org-1',
    order: 0,
    createdAt: new Date('2025-01-10T10:00:00Z'),
    updatedAt: new Date('2025-01-10T10:00:00Z'),
    createdBy: 'user-1',
    translations: [
      {
        id: 'st1',
        stopId: 'stop-1',
        locale: 'en',
        currentVersionId: 'sv1',
        draftVersionId: null,
        createdAt: new Date('2025-01-10T10:00:00Z'),
        updatedAt: new Date('2025-01-10T10:00:00Z'),
        currentVersion: {
          id: 'sv1',
          translationId: 'st1',
          version: 1,
          status: 'published',
          title: 'Museum Entrance',
          description: 'Welcome to our museum. Start your journey here.',
          transcription: null,
          createdAt: new Date('2025-01-10T10:00:00Z'),
          createdBy: 'user-1',
          publishedAt: new Date('2025-01-10T10:00:00Z'),
        },
        draftVersion: null,
      },
      {
        id: 'st1-de',
        stopId: 'stop-1',
        locale: 'de',
        currentVersionId: 'sv1-de',
        draftVersionId: null,
        createdAt: new Date('2025-01-10T10:00:00Z'),
        updatedAt: new Date('2025-01-10T10:00:00Z'),
        currentVersion: {
          id: 'sv1-de',
          translationId: 'st1-de',
          version: 1,
          status: 'published',
          title: 'Museumseingang',
          description: 'Willkommen in unserem Museum. Beginnen Sie hier Ihre Reise.',
          transcription: null,
          createdAt: new Date('2025-01-10T10:00:00Z'),
          createdBy: 'user-1',
          publishedAt: new Date('2025-01-10T10:00:00Z'),
        },
        draftVersion: null,
      },
    ],
  },
  {
    id: 'stop-2',
    guideId: 'guide-1',
    nanoId: 'stop2def',
    organizationId: 'org-1',
    order: 1,
    createdAt: new Date('2025-01-10T11:00:00Z'),
    updatedAt: new Date('2025-01-10T11:00:00Z'),
    createdBy: 'user-1',
    translations: [
      {
        id: 'st2',
        stopId: 'stop-2',
        locale: 'en',
        currentVersionId: 'sv2',
        draftVersionId: null,
        createdAt: new Date('2025-01-10T11:00:00Z'),
        updatedAt: new Date('2025-01-10T11:00:00Z'),
        currentVersion: {
          id: 'sv2',
          translationId: 'st2',
          version: 1,
          status: 'published',
          title: 'Main Gallery',
          description: 'Explore our permanent collection of Renaissance art.',
          transcription: null,
          createdAt: new Date('2025-01-10T11:00:00Z'),
          createdBy: 'user-1',
          publishedAt: new Date('2025-01-10T11:00:00Z'),
        },
        draftVersion: null,
      },
    ],
  },
  {
    id: 'stop-3',
    guideId: 'guide-1',
    nanoId: 'stop3ghi',
    organizationId: 'org-1',
    order: 2,
    createdAt: new Date('2025-01-10T12:00:00Z'),
    updatedAt: new Date('2025-01-10T12:00:00Z'),
    createdBy: 'user-1',
    translations: [
      {
        id: 'st3',
        stopId: 'stop-3',
        locale: 'en',
        currentVersionId: 'sv3',
        draftVersionId: null,
        createdAt: new Date('2025-01-10T12:00:00Z'),
        updatedAt: new Date('2025-01-10T12:00:00Z'),
        currentVersion: {
          id: 'sv3',
          translationId: 'st3',
          version: 1,
          status: 'published',
          title: 'Sculpture Garden',
          description: 'A serene outdoor space featuring contemporary sculptures.',
          transcription: null,
          createdAt: new Date('2025-01-10T12:00:00Z'),
          createdBy: 'user-1',
          publishedAt: new Date('2025-01-10T12:00:00Z'),
        },
        draftVersion: null,
      },
    ],
  },
]

const baseGuide: GuideWithStops = {
  id: 'guide-1',
  nanoId: 'abc123xyz',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  createdBy: 'user-1',
  updatedBy: 'user-1',
  published: null,
  coverImage: null,
  organizationId: 'org-1',
  archivedAt: null,
  deletedAt: null,
  translations: [
    {
      id: 'gt1',
      guideId: 'guide-1',
      locale: 'en',
      currentVersionId: 'gv1',
      draftVersionId: null,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-15T14:30:00Z'),
      currentVersion: {
        id: 'gv1',
        translationId: 'gt1',
        version: 1,
        status: 'published',
        title: 'City Art Museum Audio Tour',
        description:
          'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-01T10:00:00Z'),
      },
      draftVersion: null,
    },
    {
      id: 'gt1-de',
      guideId: 'guide-1',
      locale: 'de',
      currentVersionId: 'gv1-de',
      draftVersionId: null,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-15T14:30:00Z'),
      currentVersion: {
        id: 'gv1-de',
        translationId: 'gt1-de',
        version: 1,
        status: 'published',
        title: 'Städtisches Kunstmuseum Audio-Tour',
        description:
          'Entdecken Sie die reiche Geschichte und die beeindruckenden Kunstwerke des Städtischen Kunstmuseums mit diesem umfassenden Audio-Guide.',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-01T10:00:00Z'),
      },
      draftVersion: null,
    },
  ],
  stops: mockStops,
}

const meta = {
  title: 'Studio/Pages/Guides/Edit/GuideEditView',
  component: GuideEditView,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story, { args }) => (
      <GuideEditorProvider initialGuide={args.guide ?? baseGuide}>
        <Story />
      </GuideEditorProvider>
    ),
  ],
} satisfies Meta<typeof GuideEditView & { guide: GuideWithStops }>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    guide: baseGuide,
  },
}

export const WithCoverImage: Story = {
  args: {
    guide: {
      ...baseGuide,
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
    },
  },
}

export const WithDraft: Story = {
  args: {
    guide: {
      ...baseGuide,
      translations: [
        {
          ...baseGuide.translations[0],
          draftVersionId: 'gv2',
          draftVersion: {
            id: 'gv2',
            translationId: 'gt1',
            version: 2,
            status: 'draft',
            title: 'City Art Museum Audio Tour - Updated',
            description:
              'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide. Now with new exhibits!',
            createdAt: new Date('2025-01-16T10:00:00Z'),
            createdBy: 'user-1',
            publishedAt: null,
          },
        },
        baseGuide.translations[1],
      ],
    },
  },
}

export const Published: Story = {
  args: {
    guide: {
      ...baseGuide,
      published: new Date('2025-01-10T10:00:00Z'),
      coverImage: faker.image.url({ width: 2070, height: 1380 }),
    },
  },
}

export const EmptyGuide: Story = {
  args: {
    guide: {
      ...baseGuide,
      translations: [
        {
          id: 'gt-empty',
          guideId: 'guide-1',
          locale: 'en',
          currentVersionId: null,
          draftVersionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: null,
          draftVersion: null,
        },
      ],
      stops: [],
    },
  },
}

export const ManyStops: Story = {
  args: {
    guide: {
      ...baseGuide,
      stops: Array.from({ length: 10 }, (_, i) => ({
        id: `stop-${i + 1}`,
        guideId: 'guide-1',
        nanoId: `stop${i + 1}nano`,
        organizationId: 'org-1',
        order: i,
        createdAt: new Date('2025-01-10T10:00:00Z'),
        updatedAt: new Date('2025-01-10T10:00:00Z'),
        createdBy: 'user-1',
        translations: [
          {
            id: `st-${i + 1}`,
            stopId: `stop-${i + 1}`,
            locale: 'en',
            currentVersionId: `sv-${i + 1}`,
            draftVersionId: null,
            createdAt: new Date('2025-01-10T10:00:00Z'),
            updatedAt: new Date('2025-01-10T10:00:00Z'),
            currentVersion: {
              id: `sv-${i + 1}`,
              translationId: `st-${i + 1}`,
              version: 1,
              status: 'published' as const,
              title: `Stop ${i + 1}: ${['Gallery', 'Exhibition', 'Courtyard', 'Hall', 'Room'][i % 5]} ${Math.floor(i / 5) + 1}`,
              description: `Description for stop ${i + 1}`,
              transcription: null,
              createdAt: new Date('2025-01-10T10:00:00Z'),
              createdBy: 'user-1',
              publishedAt: new Date('2025-01-10T10:00:00Z'),
            },
            draftVersion: null,
          },
        ],
      })),
    },
  },
}
