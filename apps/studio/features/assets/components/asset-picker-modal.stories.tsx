// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '@valguide/ui/components/button'
import { AssetPickerModal } from './asset-picker-modal'
import type { Asset } from '@valguide/core/features/assets/schema'

const meta = {
    title: 'Assets/AssetPickerModal',
    component: AssetPickerModal,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        onSelect: { action: 'assets-selected' },
        onUploadComplete: { action: 'upload-complete' },
    },
} satisfies Meta<typeof AssetPickerModal>

export default meta
type Story = StoryObj<typeof meta>

const mockAssets: Asset[] = [
    {
        id: '1',
        nanoId: 'img1',
        fileName: 'museum-entrance.jpg',
        fileSize: 2048576,
        mimeType: 'image/jpeg',
        type: 'image',
        storagePath: 'org/images/user/img1-museum-entrance.jpg',
        publicUrl: 'https://picsum.photos/seed/1/400/300',
        locale: null,
        width: 1920,
        height: 1080,
        duration: null,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-10T10:00:00Z'),
        updatedAt: new Date('2025-01-10T10:00:00Z'),
    },
    {
        id: '2',
        nanoId: 'img2',
        fileName: 'artifact-display.jpg',
        fileSize: 3145728,
        mimeType: 'image/jpeg',
        type: 'image',
        storagePath: 'org/images/user/img2-artifact.jpg',
        publicUrl: 'https://picsum.photos/seed/2/400/300',
        locale: 'de',
        width: 1920,
        height: 1080,
        duration: null,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-09T14:30:00Z'),
        updatedAt: new Date('2025-01-09T14:30:00Z'),
    },
    {
        id: '3',
        nanoId: 'img3',
        fileName: 'sculpture-closeup.jpg',
        fileSize: 4194304,
        mimeType: 'image/jpeg',
        type: 'image',
        storagePath: 'org/images/user/img3-sculpture.jpg',
        publicUrl: 'https://picsum.photos/seed/3/400/300',
        locale: null,
        width: 2560,
        height: 1440,
        duration: null,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-06T11:00:00Z'),
        updatedAt: new Date('2025-01-06T11:00:00Z'),
    },
    {
        id: '4',
        nanoId: 'img4',
        fileName: 'gallery-view.jpg',
        fileSize: 2500000,
        mimeType: 'image/jpeg',
        type: 'image',
        storagePath: 'org/images/user/img4-gallery.jpg',
        publicUrl: 'https://picsum.photos/seed/4/400/300',
        locale: 'en',
        width: 1920,
        height: 1080,
        duration: null,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-05T09:00:00Z'),
        updatedAt: new Date('2025-01-05T09:00:00Z'),
    },
    {
        id: '5',
        nanoId: 'aud1',
        fileName: 'intro-narration-en.mp3',
        fileSize: 5242880,
        mimeType: 'audio/mpeg',
        type: 'audio',
        storagePath: 'org/audios/en/aud1-intro.mp3',
        publicUrl: null,
        locale: 'en',
        width: null,
        height: null,
        duration: 180,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-08T09:15:00Z'),
        updatedAt: new Date('2025-01-08T09:15:00Z'),
    },
    {
        id: '6',
        nanoId: 'aud2',
        fileName: 'intro-narration-de.mp3',
        fileSize: 5242880,
        mimeType: 'audio/mpeg',
        type: 'audio',
        storagePath: 'org/audios/de/aud2-intro.mp3',
        publicUrl: null,
        locale: 'de',
        width: null,
        height: null,
        duration: 185,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-08T09:20:00Z'),
        updatedAt: new Date('2025-01-08T09:20:00Z'),
    },
    {
        id: '7',
        nanoId: 'aud3',
        fileName: 'background-music.mp3',
        fileSize: 3145728,
        mimeType: 'audio/mpeg',
        type: 'audio',
        storagePath: 'org/audios/aud3-music.mp3',
        publicUrl: null,
        locale: null,
        width: null,
        height: null,
        duration: 240,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-07T10:00:00Z'),
        updatedAt: new Date('2025-01-07T10:00:00Z'),
    },
    {
        id: '8',
        nanoId: 'vid1',
        fileName: 'welcome-video-en.mp4',
        fileSize: 52428800,
        mimeType: 'video/mp4',
        type: 'video',
        storagePath: 'org/videos/en/vid1-welcome.mp4',
        publicUrl: null,
        locale: 'en',
        width: 1920,
        height: 1080,
        duration: 120,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-07T16:45:00Z'),
        updatedAt: new Date('2025-01-07T16:45:00Z'),
    },
    {
        id: '9',
        nanoId: 'vid2',
        fileName: 'tour-preview-de.mp4',
        fileSize: 45000000,
        mimeType: 'video/mp4',
        type: 'video',
        storagePath: 'org/videos/de/vid2-tour.mp4',
        publicUrl: null,
        locale: 'de',
        width: 1920,
        height: 1080,
        duration: 90,
        organizationId: 'org-123',
        uploadedBy: 'user-456',
        createdAt: new Date('2025-01-06T14:00:00Z'),
        updatedAt: new Date('2025-01-06T14:00:00Z'),
    },
]

type PickerWrapperProps = React.ComponentProps<typeof AssetPickerModal>

const PickerWrapper = (args: PickerWrapperProps) => {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Picker</Button>
      <AssetPickerModal {...args} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const SingleSelectImage: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'image',
        organizationId: 'org-123',
        multiple: false,
        assets: mockAssets,
    },
}

export const MultiSelectImageGallery: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'image',
        organizationId: 'org-123',
        multiple: true,
        assets: mockAssets,
    },
}

export const AudioPickerWithLocale: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'audio',
        locale: 'en',
        organizationId: 'org-123',
        multiple: false,
        assets: mockAssets,
    },
}

export const AudioPickerGermanLocale: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'audio',
        locale: 'de',
        organizationId: 'org-123',
        multiple: false,
        assets: mockAssets,
    },
}

export const VideoPickerWithLocale: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'video',
        locale: 'en',
        organizationId: 'org-123',
        multiple: false,
        assets: mockAssets,
    },
}

export const EmptyLibrary: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'image',
        organizationId: 'org-123',
        multiple: false,
        assets: [],
    },
}

export const Loading: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'image',
        organizationId: 'org-123',
        multiple: false,
        isLoading: true,
        assets: [],
    },
}

export const ManyAssets: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'image',
        organizationId: 'org-123',
        multiple: true,
        assets: [
            ...mockAssets,
            ...mockAssets.map((a, i) => ({
                ...a,
                id: `${a.id}-dup1-${i}`,
                nanoId: `${a.nanoId}-dup1`,
            })),
            ...mockAssets.map((a, i) => ({
                ...a,
                id: `${a.id}-dup2-${i}`,
                nanoId: `${a.nanoId}-dup2`,
            })),
        ].filter((a) => a.type === 'image'),
    },
}

export const WithPreselectedAssets: Story = {
    render: (args) => <PickerWrapper {...args} />,
    args: {
        type: 'image',
        organizationId: 'org-123',
        multiple: true,
        selectedAssetIds: ['1', '3'],
        assets: mockAssets,
    },
}
