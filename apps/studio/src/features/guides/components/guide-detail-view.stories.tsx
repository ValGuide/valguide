// @ts-nocheck - Storybook types only available in storybook package
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { GuideDetailItem } from '@valguide/core/features/guides/types'
import { Button } from '@valguide/ui/components/button'
import { fn } from 'storybook/test'
import { GuideDetailView } from './guide-detail-view'

const mockGuide: GuideDetailItem = {
  id: 'guide-uuid-123',
  nanoId: 'abc123xyz',
  organizationId: 'org-1',
  published: null,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  coverImageUrl: null,
  displayTitle: 'City Art Museum Audio Tour',
  displayDescription:
    'Discover the rich history and stunning artworks of the City Art Museum through this comprehensive audio guide.',
  displayLocale: 'en',
  translationSummaries: [
    { locale: 'en', hasPublished: true, hasDraft: false },
    { locale: 'de', hasPublished: true, hasDraft: false },
  ],
  availableLocales: ['en', 'de'],
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

export const WithCoverImage: Story = {
  args: {
    guide: {
      ...mockGuide,
      coverImageUrl: faker.image.url({ width: 2070, height: 1380 }),
    },
  },
}

export const Published: Story = {
  args: {
    guide: {
      ...mockGuide,
      published: new Date('2025-01-10T10:00:00Z'),
      coverImageUrl: faker.image.url({ width: 2070, height: 1380 }),
    },
  },
}

export const WithLongTitle: Story = {
  args: {
    guide: {
      ...mockGuide,
      displayTitle:
        'The Complete History of the National Art Gallery and Its Permanent Collection of Renaissance Masterpieces',
    },
  },
}

export const WithRichDescription: Story = {
  args: {
    guide: {
      ...mockGuide,
      displayDescription: `<p>Welcome to our <strong>comprehensive audio guide</strong> for the City Art Museum.</p>
<p>This tour covers:</p>
<ul>
<li>The main gallery featuring Renaissance masterpieces</li>
<li>The sculpture garden with modern installations</li>
<li>The special exhibitions hall</li>
</ul>
<p>Duration: approximately <em>90 minutes</em></p>`,
    },
  },
}

export const SingleLanguage: Story = {
  args: {
    guide: {
      ...mockGuide,
      availableLocales: ['en'],
      translationSummaries: [{ locale: 'en', hasPublished: true, hasDraft: false }],
    },
  },
}

export const ManyLanguages: Story = {
  args: {
    guide: {
      ...mockGuide,
      availableLocales: ['en', 'de', 'fr', 'it', 'es', 'rm'],
      translationSummaries: [
        { locale: 'en', hasPublished: true, hasDraft: false },
        { locale: 'de', hasPublished: true, hasDraft: false },
        { locale: 'fr', hasPublished: false, hasDraft: true },
        { locale: 'it', hasPublished: false, hasDraft: true },
        { locale: 'es', hasPublished: false, hasDraft: false },
        { locale: 'rm', hasPublished: true, hasDraft: true },
      ],
    },
  },
}

export const NoDescription: Story = {
  args: {
    guide: {
      ...mockGuide,
      displayDescription: null,
    },
  },
}
