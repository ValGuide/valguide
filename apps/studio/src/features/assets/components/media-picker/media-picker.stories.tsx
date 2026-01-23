// @ts-nocheck - Storybook types only available in storybook package
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import type { Asset } from '@valguide/core/features/assets/schema'
import { useState } from 'react'
import { MockAssetsProvider } from '../../context/mock-assets-provider'
import { MediaPicker } from './media-picker'
import type { MediaPickerComponentProps } from './types'

const mockOnUpload = async (_file: File, onProgress: (p: number) => void) => {
  for (let i = 0; i <= 100; i += 20) {
    await new Promise((r) => setTimeout(r, 200))
    onProgress(i)
  }
  return null
}

const meta = {
  title: 'Assets/MediaPicker',
  component: MediaPicker,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: { type: 'radio' },
      options: ['single', 'multiple'],
    },
    mediaTypes: {
      control: { type: 'check' },
      options: ['image', 'audio', 'video'],
    },
  },
  decorators: [
    (Story) => (
      <MockAssetsProvider>
        <div className="w-full max-w-100">
          <Story />
        </div>
      </MockAssetsProvider>
    ),
  ],
} satisfies Meta<typeof MediaPicker>

export default meta
type Story = StoryObj<typeof meta>

const mockImageAsset: Asset = {
  id: '1',
  nanoId: 'img1',
  fileName: 'museum-entrance.jpg',
  fileSize: 2048576,
  mimeType: 'image/jpeg',
  type: 'image',
  storagePath: '',
  publicUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: 'art' }),
  locale: null,
  width: 1920,
  height: 1080,
  duration: null,
  organizationId: 'org-123',
  uploadedBy: 'user-456',
  createdAt: new Date('2025-01-10T10:00:00Z'),
  updatedAt: new Date('2025-01-10T10:00:00Z'),
}

const mockAudioAsset: Asset = {
  id: '2',
  nanoId: 'aud1',
  fileName: 'narration-en.mp3',
  fileSize: 5242880,
  mimeType: 'audio/mpeg',
  type: 'audio',
  storagePath: '',
  publicUrl: null,
  locale: 'en',
  width: null,
  height: null,
  duration: 180,
  organizationId: 'org-123',
  uploadedBy: 'user-456',
  createdAt: new Date('2025-01-08T09:15:00Z'),
  updatedAt: new Date('2025-01-08T09:15:00Z'),
}

const mockGalleryAssets: Asset[] = [
  mockImageAsset,
  {
    ...mockImageAsset,
    id: '2',
    nanoId: 'img2',
    fileName: 'artifact-display.jpg',
    publicUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: 'museum' }),
  },
  {
    ...mockImageAsset,
    id: '3',
    nanoId: 'img3',
    fileName: 'sculpture.jpg',
    publicUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: 'sculpture' }),
  },
]

type MediaPickerWrapperProps = Omit<MediaPickerComponentProps, 'value' | 'onChange'> & {
  initialValue?: Asset | Asset[] | null
}

function MediaPickerWrapper({ initialValue = null, ...props }: MediaPickerWrapperProps) {
  const [value, setValue] = useState<Asset | Asset[] | null>(initialValue)
  return <MediaPicker {...props} value={value} onChange={setValue} onUpload={mockOnUpload} />
}

export const Empty: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['image'],
    label: 'Cover Image',
  },
}

export const EmptyWithHelper: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['image'],
    label: 'Cover Image',
    helperText: 'Recommended size: 1200x630 pixels',
  },
}

export const SingleImageFilled: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['image'],
    label: 'Cover Image',
    initialValue: mockImageAsset,
  },
}

export const SingleAudioFilled: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['audio'],
    label: 'Narration',
    initialValue: mockAudioAsset,
  },
}

export const MultipleEmpty: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'multiple',
    mediaTypes: ['image', 'video'],
    label: 'Gallery',
  },
}

export const MultipleFilled: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'multiple',
    mediaTypes: ['image', 'video'],
    label: 'Gallery',
    initialValue: mockGalleryAssets,
  },
}

export const NoLibrary: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['image'],
    label: 'Profile Photo',
    showLibrary: false,
  },
}

export const Disabled: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['image'],
    label: 'Cover Image',
    disabled: true,
  },
}

export const DisabledWithValue: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['image'],
    label: 'Cover Image',
    disabled: true,
    initialValue: mockImageAsset,
  },
}

export const AudioOnly: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'multiple',
    mediaTypes: ['audio'],
    label: 'Audio Files',
  },
}

export const VideoOnly: Story = {
  render: (args) => <MediaPickerWrapper {...args} />,
  args: {
    mode: 'single',
    mediaTypes: ['video'],
    label: 'Intro Video',
  },
}

export const MultipleFilledUploading: Story = {
  render: () => {
    const { MediaPickerGallery } = require('./media-picker-gallery')
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Gallery</p>
        <MediaPickerGallery
          assets={mockGalleryAssets}
          onRemove={() => {}}
          onAdd={() => {}}
          acceptedMimeTypes={['image/*', 'video/*']}
          uploading={true}
          uploadProgress={45}
          uploadFileName="new-photo.jpg"
        />
      </div>
    )
  },
  args: {
    mode: 'multiple',
    mediaTypes: ['image', 'video'],
    label: 'Gallery',
    initialValue: mockGalleryAssets,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the upload progress inline as a card in the grid instead of replacing the entire gallery.',
      },
    },
  },
}
