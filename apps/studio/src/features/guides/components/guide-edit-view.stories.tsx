// @ts-nocheck - Storybook types only available in storybook package
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideWithStopsAndAssets, StopWithAssets } from '@valguide/core/features/guides/types'
import type { MediaPickerComponentProps } from '@/features/assets/components/media-picker/types'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import { MockGuideEditorProvider } from '@/features/guides/contexts/mock-guide-editor-provider'
import { GuideEditView } from './guide-edit-view'

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

const mockStops: StopWithAssets[] = [
  {
    id: 'stop-1',
    guideId: 'guide-1',
    nanoId: 'stop1abc',
    organizationId: 'org-1',
    order: 0,
    createdAt: new Date('2025-01-10T10:00:00Z'),
    updatedAt: new Date('2025-01-10T10:00:00Z'),
    createdBy: 'user-1',
    assets: [],
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
    assets: [],
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
    assets: [],
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

const baseGuide: GuideWithStopsAndAssets = {
  id: 'guide-1',
  nanoId: 'abc123xyz',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  createdBy: 'user-1',
  updatedBy: 'user-1',
  published: null,
  organizationId: 'org-1',
  archivedAt: null,
  deletedAt: null,
  availableLocales: ['en', 'de'],
  assets: [],
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

const mockOnPublish = async (_guideId: string, _locale: string) => {
  console.log('Publishing guide:', _guideId, _locale)
  return { success: true }
}

const mockOnUnpublish = async (_guideId: string, _locale: string) => {
  console.log('Unpublishing guide:', _guideId, _locale)
  return { success: true }
}

const mockOnDiscard = async (_guideId: string, _locale: string) => {
  console.log('Discarding draft:', _guideId, _locale)
  return { success: true }
}

const meta = {
  title: 'Studio/Pages/Guides/Edit/GuideEditView',
  component: GuideEditView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onPublish: mockOnPublish,
    onUnpublish: mockOnUnpublish,
    onDiscard: mockOnDiscard,
    MediaPicker: StoryMediaPicker,
  },
  decorators: [
    (Story, { args }) => (
      <MockAssetsProvider>
        <MockGuideEditorProvider initialGuide={args.guide ?? baseGuide}>
          <Story />
        </MockGuideEditorProvider>
      </MockAssetsProvider>
    ),
  ],
} satisfies Meta<typeof GuideEditView & { guide: GuideWithStops; organizationId: string }>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    guide: baseGuide,
    organizationId: 'org-mock-123',
  },
}

export const WithCoverImage: Story = {
  args: {
    guide: {
      ...baseGuide,
      assets: [
        {
          id: 'cover-1',
          nanoId: 'cover1abc',
          type: 'image',
          role: 'cover',
          guideAssetId: 'ga-1',
          fileName: 'cover-image.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          storagePath: '',
          publicUrl: faker.image.url({ width: 2070, height: 1380 }),
          locale: null,
          width: 2070,
          height: 1380,
          duration: null,
          organizationId: 'org-1',
          uploadedBy: 'user-1',
          createdAt: new Date('2025-01-10T10:00:00Z'),
          updatedAt: new Date('2025-01-10T10:00:00Z'),
        },
      ],
    },
    organizationId: 'org-mock-123',
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
    organizationId: 'org-mock-123',
  },
}

export const Published: Story = {
  args: {
    guide: {
      ...baseGuide,
      published: new Date('2025-01-10T10:00:00Z'),
      assets: [
        {
          id: 'cover-2',
          nanoId: 'cover2abc',
          type: 'image',
          role: 'cover',
          guideAssetId: 'ga-2',
          fileName: 'published-cover.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          storagePath: '',
          publicUrl: faker.image.url({ width: 2070, height: 1380 }),
          locale: null,
          width: 2070,
          height: 1380,
          duration: null,
          organizationId: 'org-1',
          uploadedBy: 'user-1',
          createdAt: new Date('2025-01-10T10:00:00Z'),
          updatedAt: new Date('2025-01-10T10:00:00Z'),
        },
      ],
    },
    organizationId: 'org-mock-123',
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
    organizationId: 'org-mock-123',
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
        assets: [],
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
    organizationId: 'org-mock-123',
  },
}
