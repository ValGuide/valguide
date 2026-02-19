import type { Meta, StoryObj } from '@storybook/react'
import { TourPreviewCard } from './preview-card'

const meta: Meta<typeof TourPreviewCard> = {
  title: 'Tour/PreviewCard',
  component: TourPreviewCard,
  parameters: {
    layout: 'centered',
  },
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
        storagePath: 'assets/mock/getting-started.jpg',
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
        storagePath: 'assets/mock/advanced-techniques.jpg',
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
        storagePath: 'assets/mock/expert-creation.jpg',
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
      tags: ['simple', 'no-image'],
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
        storagePath: 'assets/mock/minimal-tour.jpg',
      },
    },
  },
}
