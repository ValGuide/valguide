// @ts-nocheck - Storybook types only available in storybook package
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideLocaleData, GuideMetadata, StopMetadata } from '@valguide/core/features/guides/types'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import type { MediaPickerComponentProps } from '@/features/assets/components/media-picker/types'
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

// Mock stops with lightweight metadata
const mockStops: StopMetadata[] = [
  {
    id: 'stop-1',
    nanoId: 'stop1abc',
    position: 0,
    assets: [],
    translationStatuses: [
      { locale: 'en', currentVersionId: 'sv1', draftVersionId: null },
      { locale: 'de', currentVersionId: 'sv1-de', draftVersionId: null },
    ],
  },
  {
    id: 'stop-2',
    nanoId: 'stop2def',
    position: 1,
    assets: [],
    translationStatuses: [
      { locale: 'en', currentVersionId: 'sv2', draftVersionId: null },
      { locale: 'de', currentVersionId: null, draftVersionId: 'sv2-de-draft' },
    ],
  },
  {
    id: 'stop-3',
    nanoId: 'stop3ghi',
    position: 2,
    assets: [],
    translationStatuses: [{ locale: 'en', currentVersionId: null, draftVersionId: 'sv3-draft' }],
  },
]

// Base guide metadata (no translations, just structural info)
const baseMetadata: GuideMetadata = {
  id: 'guide-1',
  nanoId: 'abc123xyz',
  organizationId: 'org-1',
  availableLocales: ['en', 'de'],
  published: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  assets: [],
  stops: mockStops,
  translationStatuses: [
    { locale: 'en', currentVersionId: 'gv1', draftVersionId: null },
    { locale: 'de', currentVersionId: 'gv1-de', draftVersionId: null },
  ],
}

// Locale data for English
const baseLocaleDataEn: GuideLocaleData = {
  locale: 'en',
  guideTranslation: {
    translationId: 'gt1',
    currentVersionId: 'gv1',
    draftVersionId: null,
    currentVersion: {
      id: 'gv1',
      title: 'City Art Museum Audio Tour',
      description:
        'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
    },
    draftVersion: null,
  },
  stopTranslations: [
    {
      stopId: 'stop-1',
      translationId: 'st1',
      currentVersionId: 'sv1',
      draftVersionId: null,
      currentVersion: {
        id: 'sv1',
        title: 'Museum Entrance',
        description: 'Welcome to our museum. Start your journey here.',
        transcription: null,
      },
      draftVersion: null,
    },
    {
      stopId: 'stop-2',
      translationId: 'st2',
      currentVersionId: 'sv2',
      draftVersionId: null,
      currentVersion: {
        id: 'sv2',
        title: 'Main Gallery',
        description: 'The main gallery features our permanent collection.',
        transcription: null,
      },
      draftVersion: null,
    },
    {
      stopId: 'stop-3',
      translationId: 'st3',
      currentVersionId: null,
      draftVersionId: 'sv3-draft',
      currentVersion: null,
      draftVersion: {
        id: 'sv3-draft',
        title: 'Sculpture Garden (Draft)',
        description: 'Outdoor sculptures and installations.',
        transcription: null,
      },
    },
  ],
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

type StoryArgs = {
  metadata?: GuideMetadata
  localeData?: GuideLocaleData | null
  organizationId?: string
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
        <MockGuideEditorProvider
          metadata={args.metadata ?? baseMetadata}
          localeData={args.localeData ?? baseLocaleDataEn}
        >
          <Story />
        </MockGuideEditorProvider>
      </MockAssetsProvider>
    ),
  ],
} satisfies Meta<typeof GuideEditView & StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    metadata: baseMetadata,
    localeData: baseLocaleDataEn,
    organizationId: 'org-mock-123',
  },
}

export const WithCoverImage: Story = {
  args: {
    metadata: {
      ...baseMetadata,
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
          order: 0,
        },
      ],
    },
    localeData: baseLocaleDataEn,
    organizationId: 'org-mock-123',
  },
}

export const WithDraft: Story = {
  args: {
    metadata: {
      ...baseMetadata,
      translationStatuses: [
        { locale: 'en', currentVersionId: 'gv1', draftVersionId: 'gv2' },
        { locale: 'de', currentVersionId: 'gv1-de', draftVersionId: null },
      ],
    },
    localeData: {
      ...baseLocaleDataEn,
      guideTranslation: {
        translationId: 'gt1',
        currentVersionId: 'gv1',
        draftVersionId: 'gv2',
        currentVersion: {
          id: 'gv1',
          title: 'City Art Museum Audio Tour',
          description:
            'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
        },
        draftVersion: {
          id: 'gv2',
          title: 'City Art Museum Audio Tour - Updated',
          description:
            'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide. Now with new exhibits!',
        },
      },
    },
    organizationId: 'org-mock-123',
  },
}

export const Published: Story = {
  args: {
    metadata: {
      ...baseMetadata,
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
          order: 0,
        },
      ],
    },
    localeData: baseLocaleDataEn,
    organizationId: 'org-mock-123',
  },
}

export const EmptyGuide: Story = {
  args: {
    metadata: {
      ...baseMetadata,
      stops: [],
      translationStatuses: [{ locale: 'en', currentVersionId: null, draftVersionId: null }],
    },
    localeData: {
      locale: 'en',
      guideTranslation: null,
      stopTranslations: [],
    },
    organizationId: 'org-mock-123',
  },
}

export const ManyStops: Story = {
  args: {
    metadata: {
      ...baseMetadata,
      stops: Array.from({ length: 10 }, (_, i) => ({
        id: `stop-${i + 1}`,
        nanoId: `stop${i + 1}nano`,
        position: i,
        assets: [],
        translationStatuses: [{ locale: 'en', currentVersionId: `sv-${i + 1}`, draftVersionId: null }],
      })),
    },
    localeData: {
      ...baseLocaleDataEn,
      stopTranslations: Array.from({ length: 10 }, (_, i) => ({
        stopId: `stop-${i + 1}`,
        translationId: `st-${i + 1}`,
        currentVersionId: `sv-${i + 1}`,
        draftVersionId: null,
        currentVersion: {
          id: `sv-${i + 1}`,
          title: `Stop ${i + 1}: ${['Gallery', 'Exhibition', 'Courtyard', 'Hall', 'Room'][i % 5]} ${Math.floor(i / 5) + 1}`,
          description: `Description for stop ${i + 1}`,
          transcription: null,
        },
        draftVersion: null,
      })),
    },
    organizationId: 'org-mock-123',
  },
}
