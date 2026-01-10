// @ts-nocheck - Storybook types only available in storybook package
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import { useState } from 'react'
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
    assets: mockAssets.filter((a) => a.type === 'image'),
  },
}

export const MultiSelectImageGallery: Story = {
  render: (args) => <PickerWrapper {...args} />,
  args: {
    type: 'image',
    organizationId: 'org-123',
    multiple: true,
    assets: mockAssets.filter((a) => a.type === 'image'),
  },
}

export const AudioPickerWithLocale: Story = {
  render: (args) => <PickerWrapper {...args} />,
  args: {
    type: 'audio',
    locale: 'en',
    organizationId: 'org-123',
    multiple: false,
    assets: mockAssets.filter((a) => a.type === 'audio'),
  },
}

export const VideoPickerWithLocale: Story = {
  render: (args) => <PickerWrapper {...args} />,
  args: {
    type: 'video',
    locale: 'en',
    organizationId: 'org-123',
    multiple: false,
    assets: mockAssets.filter((a) => a.type === 'video'),
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
    assets: [],
    isLoading: true,
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
    assets: mockAssets.filter((a) => a.type === 'image'),
  },
}
