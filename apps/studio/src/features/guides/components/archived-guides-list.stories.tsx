import type { Meta, StoryObj } from '@storybook/react'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { ArchivedGuidesList } from './archived-guides-list'

const meta: Meta<typeof ArchivedGuidesList> = {
  title: 'Studio/Guides/ArchivedGuidesList',
  component: ArchivedGuidesList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays a list of archived guides with options to recover or permanently delete them.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const archivedGuides: GuideWithTranslations[] = [
  {
    id: '1',
    nanoId: 'abc123',
    organizationId: 'org-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    themeId: null,
    archivedAt: new Date('2024-12-01'),
    deletedAt: null,
    published: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    availableLocales: ['en'],
    translations: [
      {
        id: 't1',
        guideId: '1',
        locale: 'en',
        currentVersionId: 'v1',
        draftVersionId: 'v1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        currentVersion: {
          id: 'v1',
          translationId: 't1',
          title: 'Ancient Egypt Exhibition',
          description: 'Explore the wonders of Ancient Egypt with our interactive audio guide.',
          status: 'published',
          version: 1,
          createdAt: new Date('2024-01-15'),
          createdBy: 'user-1',
          publishedAt: new Date('2024-01-15'),
        },
      },
    ],
  },
  {
    id: '2',
    nanoId: 'def456',
    organizationId: 'org-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    themeId: null,
    archivedAt: new Date('2024-11-15'),
    deletedAt: null,
    published: null,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    availableLocales: ['en'],
    translations: [
      {
        id: 't2',
        guideId: '2',
        locale: 'en',
        currentVersionId: 'v2',
        draftVersionId: 'v2',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        currentVersion: {
          id: 'v2',
          translationId: 't2',
          title: 'Modern Art Gallery Tour',
          description: 'A comprehensive multimedia guide to contemporary masterpieces.',
          status: 'published',
          version: 1,
          createdAt: new Date('2024-02-01'),
          createdBy: 'user-1',
          publishedAt: new Date('2024-02-01'),
        },
      },
    ],
  },
  {
    id: '3',
    nanoId: 'ghi789',
    organizationId: 'org-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    themeId: null,
    archivedAt: new Date('2024-10-20'),
    deletedAt: null,
    published: null,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-10'),
    availableLocales: ['en'],
    translations: [
      {
        id: 't3',
        guideId: '3',
        locale: 'en',
        currentVersionId: 'v3',
        draftVersionId: 'v3',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        currentVersion: {
          id: 'v3',
          translationId: 't3',
          title: 'Historic City Walking Tour',
          description: null,
          status: 'published',
          version: 1,
          createdAt: new Date('2024-03-01'),
          createdBy: 'user-1',
          publishedAt: new Date('2024-03-01'),
        },
      },
    ],
  },
]

const mockOnRecover = async (id: string) => {
  console.log('Recovering guide:', id)
}

const mockOnDelete = async (id: string) => {
  console.log('Deleting guide:', id)
}

export const Empty: Story = {
  args: {
    guides: [],
    userId: 'user-1',
    onRecover: mockOnRecover,
    onDelete: mockOnDelete,
  },
}

export const WithArchivedGuides: Story = {
  args: {
    guides: archivedGuides,
    userId: 'user-1',
    onRecover: mockOnRecover,
    onDelete: mockOnDelete,
  },
}

export const SingleGuide: Story = {
  args: {
    guides: archivedGuides.slice(0, 1),
    userId: 'user-1',
    onRecover: mockOnRecover,
    onDelete: mockOnDelete,
  },
}

export const WithActionHandler: Story = {
  args: {
    guides: archivedGuides,
    userId: 'user-1',
    onRecover: mockOnRecover,
    onDelete: mockOnDelete,
    onActionComplete: () => {
      console.log('Action completed!')
    },
  },
}
