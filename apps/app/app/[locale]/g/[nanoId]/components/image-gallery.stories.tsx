import type { Meta, StoryObj } from '@storybook/react'
import { ImageGallery } from './image-gallery'

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
    storagePath: '/images/landscape.jpg',
    publicUrl: 'https://picsum.photos/800/600?random=1',
    locale: null,
    width: 800,
    height: 600,
    duration: null,
    organizationId: null,
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
    storagePath: '/images/portrait.jpg',
    publicUrl: 'https://picsum.photos/600/800?random=2',
    locale: null,
    width: 600,
    height: 800,
    duration: null,
    organizationId: null,
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
    storagePath: '/images/square.jpg',
    publicUrl: 'https://picsum.photos/800/800?random=3',
    locale: null,
    width: 800,
    height: 800,
    duration: null,
    organizationId: null,
    uploadedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'gallery',
    order: 2,
  },
]

export const SingleImage: Story = {
  args: {
    images: [mockImages[0]!],
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
