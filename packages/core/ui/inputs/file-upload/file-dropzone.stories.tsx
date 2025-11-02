import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FileDropzone } from './file-dropzone'
import { themes } from '@valguide/ui/theme/themes'

const meta: Meta<typeof FileDropzone> = {
  title: 'Inputs/FileDropzone',
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

export const Default: Story = {
  args: {
    onFilesSelected: (files) => {
      console.log('Files selected:', files)
    },
  },
}

export const ImagesOnly: Story = {
  args: {
    acceptedFileTypes: ['image/*'],
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    onFilesSelected: (files) => {
      console.log('Images selected:', files)
    },
  },
}

export const PDFOnly: Story = {
  args: {
    acceptedFileTypes: ['application/pdf'],
    maxFiles: 3,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    onFilesSelected: (files) => {
      console.log('PDFs selected:', files)
    },
  },
}

export const SingleFile: Story = {
  args: {
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    onFilesSelected: (files) => {
      console.log('File selected:', files)
    },
  },
}

export const SmallFilesOnly: Story = {
  args: {
    maxFileSize: 1 * 1024 * 1024, // 1MB
    maxFiles: 10,
    onFilesSelected: (files) => {
      console.log('Small files selected:', files)
    },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    onFilesSelected: (files) => {
      console.log('Files selected:', files)
    },
  },
}

export const CustomTranslations: Story = {
  args: {
    translations: {
      dragAndDrop: "Ziehe Dateien hierher",
      orClickToBrowse: "oder klicke zum Durchsuchen",
      dropFilesHere: "Dateien hier ablegen",
      maxFileSize: "Max. Dateigröße",
      upTo: "Bis zu",
      files: "Dateien",
      filesSelected: "ausgewählt",
      clearAll: "Alle löschen",
      complete: "Abgeschlossen",
      fileSizeExceeds: "Dateigröße überschreitet",
      limit: "Limit",
      fileTypeNotAccepted: "Dateityp nicht akzeptiert",
    },
    onFilesSelected: (files) => {
      console.log('Files selected:', files)
    },
  },
}

export const AllThemes: Story = {
  render: () => (
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
          />
        </div>
      ))}
    </div>
  ),
}

