import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import { ImageGallery } from '@/components/guides/image-gallery'

const meta: Meta<typeof ImageGallery> = {
  title: 'App/Guide/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ImageGallery>

const mockImages = [
  {
    id: '1',
    nanoId: 'img1',
    fileName: 'landscape.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    type: 'image' as const,
    storagePath: '',
    publicUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: 'art' }),
    locale: null,
    width: 800,
    height: 600,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'gallery',
    order: 0,
  },
  {
    id: '2',
    nanoId: 'img2',
    fileName: 'portrait.jpg',
    fileSize: 900000,
    mimeType: 'image/jpeg',
    type: 'image' as const,
    storagePath: '',
    publicUrl: faker.image.urlLoremFlickr({ width: 600, height: 800, category: 'art' }),
    locale: null,
    width: 600,
    height: 800,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'gallery',
    order: 1,
  },
  {
    id: '3',
    nanoId: 'img3',
    fileName: 'square.jpg',
    fileSize: 850000,
    mimeType: 'image/jpeg',
    type: 'image' as const,
    storagePath: '',
    publicUrl: faker.image.urlLoremFlickr({ width: 800, height: 800, category: 'art' }),
    locale: null,
    width: 800,
    height: 800,
    duration: null,
    organizationId: 'org-123',
    uploadedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'gallery',
    order: 2,
  },
]

export const SingleImage: Story = {
  args: {
    images: mockImages.slice(0, 1),
  },
}

export const MultipleImages: Story = {
  args: {
    images: mockImages,
  },
}

export const Empty: Story = {
  args: {
    images: [],
  },
}
