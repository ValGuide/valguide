import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import { TourPreviewCard } from './preview-card'

const mockGettingStartedImageUrl = faker.image.urlLoremFlickr({ width: 1200, height: 800, category: 'art' })
const mockAdvancedTechniquesImageUrl = faker.image.urlLoremFlickr({ width: 1200, height: 800, category: 'art' })
const mockExpertCreationImageUrl = faker.image.urlLoremFlickr({ width: 1200, height: 800, category: 'art' })
const mockMinimalTourImageUrl = faker.image.urlLoremFlickr({ width: 1200, height: 800, category: 'art' })

const meta: Meta<typeof TourPreviewCard> = {
  title: 'Tour/PreviewCard',
  component: TourPreviewCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TourPreviewCard>

export const Default: Story = {
  args: {
    tour: {
      id: '1',
      nanoId: 'getting-started-001',
      title: 'Getting Started with ValGuide',
      description: 'Learn the basics of ValGuide and how to create your first visit.',
      coverImage: {
        storagePath: mockGettingStartedImageUrl,
      },
      author: 'ValGuide Team',
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2023-11-20'),
      tags: ['beginner', 'tutorial', 'basics'],
    },
  },
}

export const Intermediate: Story = {
  args: {
    tour: {
      id: '2',
      nanoId: 'advanced-tech-002',
      title: 'Advanced Techniques',
      description: 'Discover advanced techniques to create engaging tours.',
      coverImage: {
        storagePath: mockAdvancedTechniquesImageUrl,
      },
      author: 'ValGuide Pro',
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date('2023-12-05'),
      tags: ['advanced', 'techniques', 'engagement'],
    },
  },
}

export const Advanced: Story = {
  args: {
    tour: {
      id: '3',
      nanoId: 'expert-creation-003',
      title: 'Expert Tour Creation',
      description: 'Master the art of creating professional tours with advanced features.',
      coverImage: {
        storagePath: mockExpertCreationImageUrl,
      },
      author: 'ValGuide Expert',
      createdAt: new Date('2023-08-05'),
      updatedAt: new Date('2024-01-15'),
      tags: ['expert', 'professional', 'advanced features'],
    },
  },
}

export const NoImage: Story = {
  args: {
    tour: {
      id: '4',
      nanoId: 'no-image-004',
      title: 'Tour Without Image',
      description: 'This visit does not have an image.',
      author: 'ValGuide User',
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date('2024-02-18'),
      tags: ['simple', 'no-image'],
    },
  },
}

export const NoImagePublished: Story = {
  args: {
    tour: {
      id: '6',
      nanoId: 'no-image-published-006',
      title: 'Collection Highlights',
      author: 'Curatorial Team',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-03-12'),
      published: new Date('2024-03-10'),
    },
  },
}

export const NoImageLongTitle: Story = {
  args: {
    tour: {
      id: '7',
      nanoId: 'no-image-long-title-007',
      title: 'A Long Exhibition Title That Still Needs To Feel Calm And Readable Without A Cover Image',
      author: 'ValGuide User',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-18'),
    },
  },
}

export const MinimalInfo: Story = {
  args: {
    tour: {
      id: '5',
      nanoId: 'minimal-005',
      title: 'Minimal Tour',
      coverImage: {
        storagePath: mockMinimalTourImageUrl,
      },
    },
  },
}
