// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import { mockAssets } from '../context/mock-assets-provider'
import { AssetPickerModal, type UploadInlineComponentProps } from './asset-picker-modal'

function MockUploadInline({ allowedTypes, locale }: UploadInlineComponentProps) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
      <p className="text-muted-foreground">
        Upload component (mocked) - Types: {allowedTypes?.join(', ')} {locale && `- Locale: ${locale}`}
      </p>
    </div>
  )
}

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
    onRefetch: { action: 'refetch' },
  },
  args: {
    UploadInline: MockUploadInline,
    assets: mockAssets.filter((a) => a.type === 'image'),
    isLoading: false,
  },
} satisfies Meta<typeof AssetPickerModal>

export default meta
type Story = StoryObj<typeof meta>

export const SingleSelectImage: Story = {
  args: {
    open: true,
    type: 'image',
    organizationId: 'org-123',
    multiple: false,
    assets: mockAssets.filter((a) => a.type === 'image'),
  },
}

export const MultiSelectImageGallery: Story = {
  args: {
    open: true,
    type: 'image',
    organizationId: 'org-123',
    multiple: true,
    assets: mockAssets.filter((a) => a.type === 'image'),
  },
}

export const AudioPickerWithLocale: Story = {
  args: {
    open: true,
    type: 'audio',
    locale: 'en',
    organizationId: 'org-123',
    multiple: false,
    assets: mockAssets.filter((a) => a.type === 'audio'),
  },
}

export const VideoPickerWithLocale: Story = {
  args: {
    open: true,
    type: 'video',
    locale: 'en',
    organizationId: 'org-123',
    multiple: false,
    assets: mockAssets.filter((a) => a.type === 'video'),
  },
}

export const EmptyLibrary: Story = {
  args: {
    open: true,
    type: 'image',
    organizationId: 'org-123',
    multiple: false,
    assets: [],
  },
}

export const Loading: Story = {
  args: {
    open: true,
    type: 'image',
    organizationId: 'org-123',
    multiple: false,
    assets: [],
    isLoading: true,
  },
}

export const ManyAssets: Story = {
  args: {
    open: true,
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
  args: {
    open: true,
    type: 'image',
    organizationId: 'org-123',
    multiple: true,
    selectedAssetIds: ['1', '3'],
    assets: mockAssets.filter((a) => a.type === 'image'),
  },
}
