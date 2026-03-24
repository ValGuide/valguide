// @ts-nocheck - Storybook types only available in storybook package

import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { Button } from '@valguide/ui/components/button'
import { fn } from 'storybook/test'
import { TourDetailView } from './tour-detail-view'

const mockCoverImageUrl = faker.image.urlLoremFlickr({ width: 1200, height: 800, category: 'art' })

const mockTour: TourDetail = {
  id: 'tour-uuid-123',
  nanoId: 'abc123xyz',
  slug: 'city-art-museum-tour',
  organizationId: 'org-1',
  archivedAt: null,
  publishedAt: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  availableLocales: ['en', 'de'],
  hasAnyChanges: false,
  locales: [
    {
      locale: 'en',
      title: 'City Art Museum Audio Tour',
      description:
        'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
      hasPublished: false,
      hasChanges: false,
    },
    {
      locale: 'de',
      title: 'Stadtkunstmuseum Audio Tour',
      description: 'Entdecken Sie die reiche Geschichte und atemberaubende Kunstwerke des Stadtkunstmuseums.',
      hasPublished: false,
      hasChanges: false,
    },
  ],
  settings: null,
  coverImage: null,
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
  title: 'Studio/Pages/Tours/Detail/TourDetailView',
  component: TourDetailView,
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
    onPublish: fn(async () => {}),
    ViewInAppButton: MockViewInAppButton,
    ArchiveTourButton: MockArchiveButton,
    orgSlug: 'city-art-museum',
    currentSlug: 'city-art-museum-tour',
  },
} satisfies Meta<typeof TourDetailView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tour: mockTour,
  },
}

export const WithCoverImage: Story = {
  args: {
    tour: {
      ...mockTour,
      coverImage: {
        storagePath: mockCoverImageUrl,
      },
    },
  },
}

export const Published: Story = {
  args: {
    tour: {
      ...mockTour,
      publishedAt: new Date('2025-01-10T12:00:00Z'),
      locales: mockTour.locales.map((l) => ({
        ...l,
        hasPublished: true,
        hasChanges: false,
      })),
    },
  },
}

export const PublishedWithChanges: Story = {
  args: {
    tour: {
      ...mockTour,
      publishedAt: new Date('2025-01-10T12:00:00Z'),
      locales: [
        { ...mockTour.locales[0], hasPublished: true, hasChanges: true },
        { ...mockTour.locales[1], hasPublished: true, hasChanges: false },
      ],
    },
  },
}

export const WithLongTitle: Story = {
  args: {
    tour: {
      ...mockTour,
      locales: [
        {
          ...mockTour.locales[0],
          title:
            'The Complete History of the National Art Gallery and Its Permanent Collection of Renaissance Masterpieces',
        },
        ...mockTour.locales.slice(1),
      ],
    },
  },
}

export const WithRichDescription: Story = {
  args: {
    tour: {
      ...mockTour,
      locales: [
        {
          ...mockTour.locales[0],
          description: `<p>Welcome to our <strong>comprehensive audio guide</strong> for the City Art Museum.</p>
<p>This tour covers:</p>
<ul>
<li>The main gallery featuring Renaissance masterpieces</li>
<li>The sculpture garden with modern installations</li>
<li>The special exhibitions hall</li>
</ul>
<p>Duration: approximately <em>90 minutes</em></p>`,
        },
        ...mockTour.locales.slice(1),
      ],
    },
  },
}

export const SingleLanguage: Story = {
  args: {
    tour: {
      ...mockTour,
      availableLocales: ['en'],
      locales: [mockTour.locales[0]],
    },
  },
}

export const ManyLanguages: Story = {
  args: {
    tour: {
      ...mockTour,
      availableLocales: ['en', 'de', 'fr', 'it', 'es', 'rm'],
      locales: [
        {
          locale: 'en',
          title: 'English Title',
          description: 'English description',
          hasPublished: true,
          hasChanges: false,
        },
        {
          locale: 'de',
          title: 'German Title',
          description: 'German description',
          hasPublished: true,
          hasChanges: false,
        },
        {
          locale: 'fr',
          title: 'French Title',
          description: 'French description',
          hasPublished: false,
          hasChanges: false,
        },
        {
          locale: 'it',
          title: 'Italian Title',
          description: 'Italian description',
          hasPublished: false,
          hasChanges: false,
        },
        {
          locale: 'es',
          title: null,
          description: null,
          hasPublished: false,
          hasChanges: false,
        },
        {
          locale: 'rm',
          title: 'Romansh Title',
          description: 'Romansh description',
          hasPublished: true,
          hasChanges: false,
        },
      ],
    },
  },
}

export const NoDescription: Story = {
  args: {
    tour: {
      ...mockTour,
      locales: [{ ...mockTour.locales[0], description: null }, ...mockTour.locales.slice(1)],
    },
  },
}
