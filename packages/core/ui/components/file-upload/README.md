# File Dropzone

A responsive, accessible file upload component with drag-and-drop support, file validation, and internationalization.

## Features

- ✅ **Drag and drop** or click to browse
- ✅ **File validation** (type, size)
- ✅ **Multiple file support** with configurable limits
- ✅ **File preview** for images
- ✅ **Progress tracking** support
- ✅ **Fully responsive** (desktop and mobile)
- ✅ **Keyboard accessible**
- ✅ **Internationalization** (i18n) support
- ✅ **Dark mode** compatible
- ✅ **shadcn/ui** design patterns

## Usage

### Basic Example

```tsx
import { FileDropzone } from '@valguide/ui/inputs/file-upload'

export default function MyComponent() {
  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files)
    // Handle file upload here
  }

  return (
    <FileDropzone
      onFilesSelected={handleFilesSelected}
      maxFiles={10}
      maxFileSize={5 * 1024 * 1024} // 5MB
    />
  )
}
```

### Images Only

```tsx
<FileDropzone
  acceptedFileTypes={['image/*']}
  maxFiles={5}
  maxFileSize={10 * 1024 * 1024} // 10MB
  onFilesSelected={handleFilesSelected}
/>
```

### PDF Only

```tsx
<FileDropzone
  acceptedFileTypes={['application/pdf']}
  maxFiles={3}
  onFilesSelected={handleFilesSelected}
/>
```

### Single File Upload

```tsx
<FileDropzone
  maxFiles={1}
  onFilesSelected={handleFilesSelected}
/>
```

### With i18n (next-intl)

```tsx
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('fileDropzone')

  return (
    <FileDropzone
      onFilesSelected={handleFilesSelected}
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
```

### Disabled State

```tsx
<FileDropzone
  disabled={true}
  onFilesSelected={handleFilesSelected}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesSelected` | `(files: File[]) => void` | `undefined` | Callback function when files are selected and validated |
| `acceptedFileTypes` | `string[]` | `['*']` | Array of accepted MIME types or file extensions (e.g., `['image/*']`, `['.pdf']`, `['application/pdf']`) |
| `maxFileSize` | `number` | `5242880` (5MB) | Maximum file size in bytes |
| `maxFiles` | `number` | `10` | Maximum number of files that can be selected |
| `className` | `string` | `undefined` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the dropzone |
| `translations` | `object` | Default English | Custom translations for all text content |

## File Type Examples

### Accept All Files
```tsx
acceptedFileTypes={['*']}
```

### Accept Images Only
```tsx
acceptedFileTypes={['image/*']}
```

### Accept Specific Image Types
```tsx
acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
```

### Accept PDFs
```tsx
acceptedFileTypes={['application/pdf']}
```

### Accept Documents
```tsx
acceptedFileTypes={[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]}
```

### Accept by Extension
```tsx
acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Keyboard navigation with Enter and Space keys
- Screen reader support with ARIA labels
- Focus management
- Clear visual feedback for drag states

## Internationalization

The component includes translations for:
- English (en)
- German (de)
- Romansh (rm)

Add translations to `/packages/core/i18n/messages/{locale}.json` under the `fileDropzone` key.

## Storybook

Run Storybook to see all component variants:

```bash
pnpm storybook
```

Navigate to **Inputs > FileDropzone** to see the component in action.

