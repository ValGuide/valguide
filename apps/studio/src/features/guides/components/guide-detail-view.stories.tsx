// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import { Button } from '@valguide/ui/components/button'
import { fn } from 'storybook/test'
import { GuideDetailView } from './guide-detail-view'

const mockGuide: GuideDetail = {
  id: 'guide-uuid-123',
  nanoId: 'abc123xyz',
  organizationId: 'org-1',
  archivedAt: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  availableLocales: ['en', 'de'],
  locales: [
    {
      locale: 'en',
      title: 'City Art Museum Audio Tour',
      description:
        'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
      revision: 1,
      hasUnpublishedChanges: false,
      publishedVersionId: null,
    },
    {
      locale: 'de',
      title: 'Stadtkunstmuseum Audio Tour',
      description: 'Entdecken Sie die reiche Geschichte und atemberaubende Kunstwerke des Stadtkunstmuseums.',
      revision: 1,
      hasUnpublishedChanges: false,
      publishedVersionId: null,
    },
  ],
  settings: null,
}

function MockViewInAppButton({ published }: { published: boolean }) {
  return (
    <Button variant="outline" disabled={!published}>
      View in App
    </Button>
  )
}

function MockArchiveButton({ onArchived }: { onArchived: () => void }) {
  return (
    <Button variant="outline" onClick={onArchived}>
      Archive
    </Button>
  )
}

const meta = {
  title: 'Studio/Pages/Guides/Detail/GuideDetailView',
  component: GuideDetailView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    nanoId: 'abc123xyz',
    preferredLocale: 'en',
    appDomain: 'https://app.valguide.io',
    onBack: fn(),
    onArchived: fn(),
    onAddLanguage: fn(async () => {}),
    onRemoveLanguage: fn(async () => {}),
    ViewInAppButton: MockViewInAppButton,
    ArchiveGuideButton: MockArchiveButton,
  },
} satisfies Meta<typeof GuideDetailView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    guide: mockGuide,
  },
}

export const Published: Story = {
  args: {
    guide: {
      ...mockGuide,
      locales: mockGuide.locales.map((l) => ({
        ...l,
        publishedVersionId: 'published-version-1',
      })),
    },
  },
}

export const WithLongTitle: Story = {
  args: {
    guide: {
      ...mockGuide,
      locales: [
        {
          ...mockGuide.locales[0],
          title:
            'The Complete History of the National Art Gallery and Its Permanent Collection of Renaissance Masterpieces',
        },
        ...mockGuide.locales.slice(1),
      ],
    },
  },
}

export const WithRichDescription: Story = {
  args: {
    guide: {
      ...mockGuide,
      locales: [
        {
          ...mockGuide.locales[0],
          description: `<p>Welcome to our <strong>comprehensive audio guide</strong> for the City Art Museum.</p>
<p>This tour covers:</p>
<ul>
<li>The main gallery featuring Renaissance masterpieces</li>
<li>The sculpture garden with modern installations</li>
<li>The special exhibitions hall</li>
</ul>
<p>Duration: approximately <em>90 minutes</em></p>`,
        },
        ...mockGuide.locales.slice(1),
      ],
    },
  },
}

export const SingleLanguage: Story = {
  args: {
    guide: {
      ...mockGuide,
      availableLocales: ['en'],
      locales: [mockGuide.locales[0]],
    },
  },
}

export const ManyLanguages: Story = {
  args: {
    guide: {
      ...mockGuide,
      availableLocales: ['en', 'de', 'fr', 'it', 'es', 'rm'],
      locales: [
        {
          locale: 'en',
          title: 'English Title',
          description: 'English description',
          revision: 1,
          hasUnpublishedChanges: false,
          publishedVersionId: 'v1',
        },
        {
          locale: 'de',
          title: 'German Title',
          description: 'German description',
          revision: 1,
          hasUnpublishedChanges: false,
          publishedVersionId: 'v1',
        },
        {
          locale: 'fr',
          title: 'French Title',
          description: 'French description',
          revision: 2,
          hasUnpublishedChanges: true,
          publishedVersionId: null,
        },
        {
          locale: 'it',
          title: 'Italian Title',
          description: 'Italian description',
          revision: 2,
          hasUnpublishedChanges: true,
          publishedVersionId: null,
        },
        {
          locale: 'es',
          title: null,
          description: null,
          revision: 1,
          hasUnpublishedChanges: false,
          publishedVersionId: null,
        },
        {
          locale: 'rm',
          title: 'Romansh Title',
          description: 'Romansh description',
          revision: 3,
          hasUnpublishedChanges: true,
          publishedVersionId: 'v2',
        },
      ],
    },
  },
}

export const NoDescription: Story = {
  args: {
    guide: {
      ...mockGuide,
      locales: [{ ...mockGuide.locales[0], description: null }, ...mockGuide.locales.slice(1)],
    },
  },
}
