"use client"

import { FileDropzone } from '@valguide/ui/inputs/file-upload/file-dropzone'
import { useTranslations } from 'next-intl'

export function FileDropzoneWithI18n() {
  const t = useTranslations('fileDropzone')

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files)
    // Handle file upload here
  }

  return (
    <FileDropzone
      onFilesSelected={handleFilesSelected}
      maxFiles={10}
      maxFileSize={5 * 1024 * 1024} // 5MB
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

