// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideWithStops } from '@valguide/core/features/guides/schema-types'
import type { StopWithAssets } from '@valguide/core/features/guides/types'
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

const mockStop: StopWithAssets = {
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
        description:
          'Welcome to our museum. This is where your journey begins. The building was constructed in 1892 and has served as a cultural landmark for over a century.',
        transcription:
          'Welcome to the City Art Museum. As you enter through these grand doors, take a moment to appreciate the neoclassical architecture that has welcomed visitors for over 130 years.',
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
        description:
          'Willkommen in unserem Museum. Hier beginnt Ihre Reise. Das Gebäude wurde 1892 erbaut und ist seit über einem Jahrhundert ein kulturelles Wahrzeichen.',
        transcription:
          'Willkommen im Städtischen Kunstmuseum. Wenn Sie durch diese prächtigen Türen eintreten, nehmen Sie sich einen Moment Zeit, um die neoklassizistische Architektur zu bewundern.',
        createdAt: new Date('2025-01-10T10:00:00Z'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-10T10:00:00Z'),
      },
      draftVersion: null,
    },
  ],
}

const mockGuide: GuideWithStops = {
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
        description: 'Discover the rich history and stunning artworks of the City Art Museum.',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        createdBy: 'user-1',
        publishedAt: new Date('2025-01-01T10:00:00Z'),
      },
      draftVersion: null,
    },
  ],
  stops: [mockStop],
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
  },
  decorators: [
    (Story, { args }) => (
      <MockAssetsProvider>
        <MockGuideEditorProvider initialGuide={args.guide ?? mockGuide}>
          <Story />
        </MockGuideEditorProvider>
      </MockAssetsProvider>
    ),
  ],
} satisfies Meta<typeof StopEditView & { guide: GuideWithStops; organizationId: string }>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stop: mockStop,
    guide: mockGuide,
    organizationId: 'org-mock-123',
  },
}

export const WithDraft: Story = {
  args: {
    stop: {
      ...mockStop,
      translations: [
        {
          ...mockStop.translations[0],
          draftVersionId: 'sv2',
          draftVersion: {
            id: 'sv2',
            translationId: 'st1',
            version: 2,
            status: 'draft',
            title: 'Museum Entrance - Updated',
            description:
              'Welcome to our museum. This is where your journey begins. The building was constructed in 1892 and has served as a cultural landmark for over a century. Recently renovated in 2024.',
            transcription:
              'Welcome to the City Art Museum. As you enter through these grand doors, take a moment to appreciate the neoclassical architecture that has welcomed visitors for over 130 years. Notice the newly restored marble floors.',
            createdAt: new Date('2025-01-16T10:00:00Z'),
            createdBy: 'user-1',
            publishedAt: null,
          },
        },
        mockStop.translations[1],
      ],
    },
    guide: mockGuide,
    organizationId: 'org-mock-123',
  },
}

export const NewStop: Story = {
  args: {
    stop: {
      id: 'stop-new',
      guideId: 'guide-1',
      nanoId: 'stopnew123',
      organizationId: 'org-1',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      assets: [],
      translations: [
        {
          id: 'st-new',
          stopId: 'stop-new',
          locale: 'en',
          currentVersionId: null,
          draftVersionId: 'sv-new-draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: null,
          draftVersion: {
            id: 'sv-new-draft',
            translationId: 'st-new',
            version: 1,
            status: 'draft',
            title: '',
            description: '',
            transcription: '',
            createdAt: new Date(),
            createdBy: 'user-1',
            publishedAt: null,
          },
        },
      ],
    },
    guide: mockGuide,
    organizationId: 'org-mock-123',
  },
}

export const WithLongContent: Story = {
  args: {
    stop: {
      ...mockStop,
      translations: [
        {
          ...mockStop.translations[0],
          currentVersion: {
            ...mockStop.translations[0].currentVersion!,
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
        },
        mockStop.translations[1],
      ],
    },
    guide: mockGuide,
    organizationId: 'org-mock-123',
  },
}

export const PublishedGuide: Story = {
  args: {
    stop: mockStop,
    guide: {
      ...mockGuide,
      published: new Date('2025-01-10T10:00:00Z'),
    },
    organizationId: 'org-mock-123',
  },
}
