import type { Meta, StoryObj } from '@storybook/react'
import { CustomAssetUpload } from './asset-upload-custom'
import { useState } from 'react'
import { Button } from '@valguide/ui/components/button'

const meta = {
  title: 'Assets/CustomAssetUpload',
  component: CustomAssetUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CustomAssetUpload>

export default meta
type Story = StoryObj<typeof meta>

const ControlledWrapper = (args: any) => {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Upload Modal</Button>
      <CustomAssetUpload {...args} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const ImageUploadDefault: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
}

export const ImageUploadWithLocale: Story = {
  args: {
    type: 'image',
    locale: 'de',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
}

export const VideoUpload: Story = {
  args: {
    type: 'video',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
}

export const AudioUpload: Story = {
  args: {
    type: 'audio',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
}

export const AudioUploadWithLocale: Story = {
  args: {
    type: 'audio',
    locale: 'en',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
}

const UncontrolledStory = (args: any) => {
  return <CustomAssetUpload {...args} />
}

export const UncontrolledMode: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: (args) => <UncontrolledStory {...args} />,
}

const FileSelectedWrapper = (args: any) => {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Reopen Modal</Button>
      <CustomAssetUpload {...args} open={open} onOpenChange={setOpen} />
      <p className="mt-4 text-xs text-muted-foreground">
        Note: To test, open the modal and select a file from your system
      </p>
    </div>
  )
}

export const InteractiveFileSelection: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: (args) => <FileSelectedWrapper {...args} />,
}

const UploadingStateWrapper = (args: any) => {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Mock: This simulates the uploading state. Select a file to see the actual upload progress.
      </p>
      <CustomAssetUpload {...args} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const UploadingSimulation: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: (args) => <UploadingStateWrapper {...args} />,
}

const AllTypesWrapper = () => {
  const [imageOpen, setImageOpen] = useState(false)
  const [audioOpen, setAudioOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setImageOpen(true)}>Image Upload</Button>
        <Button onClick={() => setAudioOpen(true)}>Audio Upload</Button>
        <Button onClick={() => setVideoOpen(true)}>Video Upload</Button>
      </div>

      <CustomAssetUpload type="image" organizationId="org_123" open={imageOpen} onOpenChange={setImageOpen} />
      <CustomAssetUpload type="audio" organizationId="org_123" open={audioOpen} onOpenChange={setAudioOpen} />
      <CustomAssetUpload type="video" organizationId="org_123" open={videoOpen} onOpenChange={setVideoOpen} />
    </div>
  )
}

export const AllAssetTypes: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: () => <AllTypesWrapper />,
}

const WithCallbacksWrapper = (args: any) => {
  const [open, setOpen] = useState(true)
  const [log, setLog] = useState<string[]>([])

  const handleUploadComplete = (asset: any) => {
    setLog((prev) => [...prev, `Upload complete: ${asset.fileName}`])
    args.onUploadComplete?.(asset)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setLog((prev) => [...prev, `Modal ${isOpen ? 'opened' : 'closed'}`])
    setOpen(isOpen)
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <CustomAssetUpload
        {...args}
        open={open}
        onOpenChange={handleOpenChange}
        onUploadComplete={handleUploadComplete}
      />
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium">Event Log:</p>
        <div className="max-h-32 overflow-y-auto rounded border p-2">
          {log.map((entry, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {entry}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export const WithEventCallbacks: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: (args) => <WithCallbacksWrapper {...args} />,
}

export const LargeVideoUpload: Story = {
  args: {
    type: 'video',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Video uploads support files up to 500MB',
      },
    },
  },
}

export const MultipleLocales: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: () => {
    const [locale, setLocale] = useState<string>('en')
    const [open, setOpen] = useState(true)

    return (
      <div>
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant={locale === 'en' ? 'default' : 'outline'} onClick={() => setLocale('en')}>
            EN
          </Button>
          <Button size="sm" variant={locale === 'de' ? 'default' : 'outline'} onClick={() => setLocale('de')}>
            DE
          </Button>
          <Button size="sm" variant={locale === 'rm' ? 'default' : 'outline'} onClick={() => setLocale('rm')}>
            RM
          </Button>
        </div>
        <CustomAssetUpload type="image" locale={locale} organizationId="org_123" open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

export const ResponsiveBehavior: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
    open: true,
  },
  render: (args) => <ControlledWrapper {...args} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Test modal responsiveness on mobile viewports',
      },
    },
  },
}

const ErrorStateDemo = () => {
  const [open, setOpen] = useState(true)
  const [showError, setShowError] = useState(false)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <div className="mt-4 p-4 max-w-2xl border rounded-lg">
        <p className="text-sm font-medium mb-2">Error State Preview:</p>
        <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">Upload failed</p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            Status: unexpected response while creating upload, originated from request (method: POST, url:
            https://zdmcpbqroqowlftvztks.storage.supabase.co/storage/v1/upload/resumable)
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          This shows how errors appear in the modal. To trigger real errors, try uploading with an invalid
          organizationId or simulate network failure.
        </p>
      </div>
      <CustomAssetUpload type="image" organizationId="org_123" open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const UploadError: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: () => <ErrorStateDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows the error state UI when upload fails. Errors can be triggered by network issues, invalid credentials, or server errors.',
      },
    },
  },
}

const FileSizeErrorDemo = () => {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <div className="mt-4 p-4 max-w-2xl border rounded-lg">
        <p className="text-sm font-medium mb-2">File Size Error Preview:</p>
        <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">Upload failed</p>
          <p className="mt-1 text-sm text-muted-foreground">File size exceeds 10MB limit</p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Images: max 10MB | Audio: max 50MB | Video: max 500MB</p>
      </div>
      <CustomAssetUpload type="image" organizationId="org_123" open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const FileSizeError: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: () => <FileSizeErrorDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Shows validation error when file exceeds the size limit. Try uploading a file larger than the limit.',
      },
    },
  },
}

const InvalidFileTypeErrorDemo = () => {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <div className="mt-4 p-4 max-w-2xl border rounded-lg">
        <p className="text-sm font-medium mb-2">Invalid File Type Error Preview:</p>
        <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">Upload failed</p>
          <p className="mt-1 text-sm text-muted-foreground">Invalid file type. Please select a image file.</p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Only specific file types are accepted for each asset type. Try uploading a non-image file to trigger this
          error.
        </p>
      </div>
      <CustomAssetUpload type="image" organizationId="org_123" open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const InvalidFileTypeError: Story = {
  args: {
    type: 'image',
    organizationId: 'org_123',
  },
  render: () => <InvalidFileTypeErrorDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows validation error when an invalid file type is selected. Each asset type has specific allowed MIME types.',
      },
    },
  },
}
