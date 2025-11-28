import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themes } from '@valguide/ui/theme/themes'
import { useTranslations } from 'next-intl'
import { FileDropzone } from './file-dropzone'

const meta: Meta<typeof FileDropzone> = {
  title: 'Common/Inputs/FileDropzone',
  component: FileDropzone,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    maxFileSize: {
      control: { type: 'number' },
      description: 'Maximum file size in bytes',
    },
    maxFiles: {
      control: { type: 'number' },
      description: 'Maximum number of files',
    },
    acceptedFileTypes: {
      control: { type: 'object' },
      description: 'Array of accepted file types (MIME types or extensions)',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the dropzone',
    },
  },
}

export default meta

type Story = StoryObj<typeof FileDropzone>

// Helper component to use translations in stories
function FileDropzoneWithTranslations(props: React.ComponentProps<typeof FileDropzone>) {
  const t = useTranslations('fileDropzone')

  return (
    <FileDropzone
      {...props}
      translations={{
        dragAndDrop: t('dragAndDrop'),
        orClickToBrowse: t('orClickToBrowse'),
        dropFilesHere: t('dropFilesHere'),
        maxFileSize: t('maxFileSize'),
        upTo: t('upTo'),
        files: t('files'),
        filesSelected: t('filesSelected'),
        clearAll: t('clearAll'),
        complete: t('complete'),
        fileSizeExceeds: t('fileSizeExceeds'),
        limit: t('limit'),
        fileTypeNotAccepted: t('fileTypeNotAccepted'),
      }}
    />
  )
}

export const Default: Story = {
  render: (args) => (
    <FileDropzoneWithTranslations
      {...args}
      onFilesSelected={(files) => {
        console.log('Files selected:', files)
      }}
    />
  ),
}

export const ImagesOnly: Story = {
  render: (args) => (
    <FileDropzoneWithTranslations
      {...args}
      acceptedFileTypes={['image/*']}
      maxFiles={5}
      maxFileSize={10 * 1024 * 1024}
      onFilesSelected={(files) => {
        console.log('Images selected:', files)
      }}
    />
  ),
}

export const PDFOnly: Story = {
  render: (args) => (
    <FileDropzoneWithTranslations
      {...args}
      acceptedFileTypes={['application/pdf']}
      maxFiles={3}
      maxFileSize={20 * 1024 * 1024}
      onFilesSelected={(files) => {
        console.log('PDFs selected:', files)
      }}
    />
  ),
}

export const SingleFile: Story = {
  render: (args) => (
    <FileDropzoneWithTranslations
      {...args}
      maxFiles={1}
      maxFileSize={5 * 1024 * 1024}
      onFilesSelected={(files) => {
        console.log('File selected:', files)
      }}
    />
  ),
}

export const SmallFilesOnly: Story = {
  render: (args) => (
    <FileDropzoneWithTranslations
      {...args}
      maxFileSize={1024 * 1024}
      maxFiles={10}
      onFilesSelected={(files) => {
        console.log('Small files selected:', files)
      }}
    />
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <FileDropzoneWithTranslations
      {...args}
      disabled={true}
      onFilesSelected={(files) => {
        console.log('Files selected:', files)
      }}
    />
  ),
}

export const AllThemes: Story = {
  render: () => {
    const t = useTranslations('fileDropzone')

    return (
      <div className="flex flex-col gap-8">
        {themes.map((theme) => (
          <div className="flex flex-col gap-4 p-6 border rounded-lg" data-theme={theme} key={theme}>
            <h2 className="text-xl font-bold capitalize">{theme}</h2>
            <FileDropzone
              maxFiles={5}
              maxFileSize={5 * 1024 * 1024}
              onFilesSelected={(files) => {
                console.log(`[${theme}] Files selected:`, files)
              }}
              translations={{
                dragAndDrop: t('dragAndDrop'),
                orClickToBrowse: t('orClickToBrowse'),
                dropFilesHere: t('dropFilesHere'),
                maxFileSize: t('maxFileSize'),
                upTo: t('upTo'),
                files: t('files'),
                filesSelected: t('filesSelected'),
                clearAll: t('clearAll'),
                complete: t('complete'),
                fileSizeExceeds: t('fileSizeExceeds'),
                limit: t('limit'),
                fileTypeNotAccepted: t('fileTypeNotAccepted'),
              }}
            />
          </div>
        ))}
      </div>
    )
  },
}
