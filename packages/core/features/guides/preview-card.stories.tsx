import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GuidePreviewCard } from './preview-card'

const meta: Meta<typeof GuidePreviewCard> = {
  title: 'Guide/PreviewCard',
  component: GuidePreviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof GuidePreviewCard>

export const Default: Story = {
  args: {
    guide: {
      id: '1',
      nanoId: 'getting-started-001',
      title: 'Getting Started with ValGuide',
      description: 'Learn the basics of ValGuide and how to create your first visit.',
      coverImage: { publicUrl: faker.image.url({ width: 2070, height: 1380 }), storagePath: '' },
      author: 'ValGuide Team',
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2023-11-20'),
      tags: ['beginner', 'tutorial', 'basics'],
    },
  },
}

export const Intermediate: Story = {
  args: {
    guide: {
      id: '2',
      nanoId: 'advanced-tech-002',
      title: 'Advanced Techniques',
      description: 'Discover advanced techniques to create engaging guides.',
      coverImage: { publicUrl: faker.image.url({ width: 2070, height: 1380 }), storagePath: '' },
      author: 'ValGuide Pro',
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date('2023-12-05'),
      tags: ['advanced', 'techniques', 'engagement'],
    },
  },
}

export const Advanced: Story = {
  args: {
    guide: {
      id: '3',
      nanoId: 'expert-creation-003',
      title: 'Expert Guide Creation',
      description: 'Master the art of creating professional guides with advanced features.',
      coverImage: { publicUrl: faker.image.url({ width: 2070, height: 1380 }), storagePath: '' },
      author: 'ValGuide Expert',
      createdAt: new Date('2023-08-05'),
      updatedAt: new Date('2024-01-15'),
      tags: ['expert', 'professional', 'advanced features'],
    },
  },
}

export const NoImage: Story = {
  args: {
    guide: {
      id: '4',
      nanoId: 'no-image-004',
      title: 'Guide Without Image',
      description: 'This visit does not have an image.',
      author: 'ValGuide User',
      createdAt: new Date('2023-12-20'),
      tags: ['simple', 'no-image'],
    },
  },
}

export const MinimalInfo: Story = {
  args: {
    guide: {
      id: '5',
      nanoId: 'minimal-005',
      title: 'Minimal Guide',
      coverImage: { publicUrl: faker.image.url({ width: 2070, height: 1380 }), storagePath: '' },
    },
  },
}
