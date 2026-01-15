// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideLocaleData, GuideMetadata, StopMetadata } from '@valguide/core/features/guides/types'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import type { MediaPickerComponentProps } from '@/features/assets/components/media-picker/types'
import { MockAssetsProvider } from '@/features/assets/context/mock-assets-provider'
import { MockGuideEditorProvider } from '@/features/guides/contexts/mock-guide-editor-provider'
import { StopEditView } from './stop-edit-view'

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

// Mock stop metadata
const mockStopMetadata: StopMetadata = {
  id: 'stop-1',
  nanoId: 'stop1abc',
  position: 0,
  assets: [],
  translationStatuses: [
    { locale: 'en', currentVersionId: 'sv1', draftVersionId: null },
    { locale: 'de', currentVersionId: 'sv1-de', draftVersionId: null },
  ],
}

// Mock guide metadata
const mockMetadata: GuideMetadata = {
  id: 'guide-1',
  nanoId: 'abc123xyz',
  organizationId: 'org-1',
  availableLocales: ['en', 'de'],
  published: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  assets: [],
  stops: [mockStopMetadata],
  translationStatuses: [
    { locale: 'en', currentVersionId: 'gv1', draftVersionId: null },
    { locale: 'de', currentVersionId: 'gv1-de', draftVersionId: null },
  ],
}

// Mock locale data for English
const mockLocaleDataEn: GuideLocaleData = {
  locale: 'en',
  guideTranslation: {
    translationId: 'gt1',
    currentVersionId: 'gv1',
    draftVersionId: null,
    currentVersion: {
      id: 'gv1',
      title: 'City Art Museum Audio Tour',
      description: 'Discover the rich history and stunning artworks of the City Art Museum.',
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
        description:
          'Welcome to our museum. This is where your journey begins. The building was constructed in 1892 and has served as a cultural landmark for over a century.',
        transcription:
          'Welcome to the City Art Museum. As you enter through these grand doors, take a moment to appreciate the neoclassical architecture that has welcomed visitors for over 130 years.',
      },
      draftVersion: null,
    },
  ],
}

const mockOnPublish = async (_stopId: string, _locale: string) => {
  console.log('Publishing stop:', _stopId, _locale)
  return { success: true }
}

const mockOnUnpublish = async (_stopId: string, _locale: string) => {
  console.log('Unpublishing stop:', _stopId, _locale)
  return { success: true }
}

const mockOnDiscard = async (_stopId: string, _locale: string) => {
  console.log('Discarding stop draft:', _stopId, _locale)
  return { success: true }
}

type StoryArgs = {
  metadata?: GuideMetadata
  localeData?: GuideLocaleData | null
  stopId?: string
  organizationId?: string
}

const meta = {
  title: 'Studio/Pages/Guides/Edit/StopEditView',
  component: StopEditView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    MediaPicker: StoryMediaPicker,
    onPublish: mockOnPublish,
    onUnpublish: mockOnUnpublish,
    onDiscard: mockOnDiscard,
    stopId: 'stop-1',
  },
  decorators: [
    (Story, { args }) => (
      <MockAssetsProvider>
        <MockGuideEditorProvider
          metadata={args.metadata ?? mockMetadata}
          localeData={args.localeData ?? mockLocaleDataEn}
        >
          <Story />
        </MockGuideEditorProvider>
      </MockAssetsProvider>
    ),
  ],
} satisfies Meta<typeof StopEditView & StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    metadata: mockMetadata,
    localeData: mockLocaleDataEn,
    stopId: 'stop-1',
    organizationId: 'org-mock-123',
  },
}

export const WithDraft: Story = {
  args: {
    metadata: {
      ...mockMetadata,
      stops: [
        {
          ...mockStopMetadata,
          translationStatuses: [
            { locale: 'en', currentVersionId: 'sv1', draftVersionId: 'sv2' },
            { locale: 'de', currentVersionId: 'sv1-de', draftVersionId: null },
          ],
        },
      ],
    },
    localeData: {
      ...mockLocaleDataEn,
      stopTranslations: [
        {
          stopId: 'stop-1',
          translationId: 'st1',
          currentVersionId: 'sv1',
          draftVersionId: 'sv2',
          currentVersion: {
            id: 'sv1',
            title: 'Museum Entrance',
            description: 'Welcome to our museum. This is where your journey begins.',
            transcription: 'Welcome to the City Art Museum.',
          },
          draftVersion: {
            id: 'sv2',
            title: 'Museum Entrance - Updated',
            description:
              'Welcome to our museum. This is where your journey begins. The building was constructed in 1892 and has served as a cultural landmark for over a century. Recently renovated in 2024.',
            transcription:
              'Welcome to the City Art Museum. As you enter through these grand doors, take a moment to appreciate the neoclassical architecture that has welcomed visitors for over 130 years. Notice the newly restored marble floors.',
          },
        },
      ],
    },
    stopId: 'stop-1',
    organizationId: 'org-mock-123',
  },
}

export const NewStop: Story = {
  args: {
    metadata: {
      ...mockMetadata,
      stops: [
        {
          id: 'stop-new',
          nanoId: 'stopnew123',
          position: 0,
          assets: [],
          translationStatuses: [{ locale: 'en', currentVersionId: null, draftVersionId: 'sv-new-draft' }],
        },
      ],
    },
    localeData: {
      locale: 'en',
      guideTranslation: mockLocaleDataEn.guideTranslation,
      stopTranslations: [
        {
          stopId: 'stop-new',
          translationId: 'st-new',
          currentVersionId: null,
          draftVersionId: 'sv-new-draft',
          currentVersion: null,
          draftVersion: {
            id: 'sv-new-draft',
            title: '',
            description: '',
            transcription: '',
          },
        },
      ],
    },
    stopId: 'stop-new',
    organizationId: 'org-mock-123',
  },
}

export const WithLongContent: Story = {
  args: {
    metadata: mockMetadata,
    localeData: {
      ...mockLocaleDataEn,
      stopTranslations: [
        {
          stopId: 'stop-1',
          translationId: 'st1',
          currentVersionId: 'sv1',
          draftVersionId: null,
          currentVersion: {
            id: 'sv1',
            title: 'The Grand Exhibition Hall: A Journey Through Renaissance Masterpieces',
            description: `The Grand Exhibition Hall is the crown jewel of our museum collection. Spanning over 2,000 square meters, this magnificent space houses some of the most significant Renaissance artworks in the Western world.

As you enter, you'll be greeted by Botticelli's "Allegory of Spring," a masterpiece that captures the essence of Renaissance beauty and symbolism. The hall's natural lighting, carefully designed by architect Henri Labrouste in 1868, illuminates each piece with perfect precision.

On your left, you'll find the Flemish Masters section, featuring works by Van Eyck, Memling, and Rogier van der Weyden. These paintings showcase the incredible attention to detail and innovative use of oil paint that characterized the Northern Renaissance.

The central gallery is dedicated to Italian masters, including works by Leonardo da Vinci, Raphael, and Michelangelo. Each piece tells a story of artistic innovation and the rebirth of classical ideals.`,
            transcription: `Welcome to the Grand Exhibition Hall, the heart of our Renaissance collection. I'm your audio guide, and I'll be taking you on a journey through some of the most important artworks in Western history.

As you step into this magnificent space, take a moment to appreciate the architecture around you. The vaulted ceilings and natural skylights were designed specifically to showcase these masterpieces in the best possible light.

Let's begin with the painting directly in front of you - Botticelli's "Allegory of Spring." Created around 1480, this work represents the pinnacle of Renaissance artistic achievement. Notice the intricate details in the flowers - botanists have identified over 500 different plant species depicted in this single painting.

Now, please turn to your left. Here you'll find our collection of Flemish Masters. These Northern European artists developed new techniques in oil painting that revolutionized the art world and influenced generations of painters to come.`,
          },
          draftVersion: null,
        },
      ],
    },
    stopId: 'stop-1',
    organizationId: 'org-mock-123',
  },
}

export const PublishedGuide: Story = {
  args: {
    metadata: {
      ...mockMetadata,
      published: new Date('2025-01-10T10:00:00Z'),
    },
    localeData: mockLocaleDataEn,
    stopId: 'stop-1',
    organizationId: 'org-mock-123',
  },
}
