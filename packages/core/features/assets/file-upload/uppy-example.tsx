'use client'

import { useEffect, useState } from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import Dashboard from '@uppy/dashboard'
import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'
import { GetUploadUrlAction } from '../actions'

export function UppyExample({ getUploadUrlAction }: { getUploadUrlAction: GetUploadUrlAction }) {
  // Initialize Uppy instance with the 'sample' bucket specified for uploads
  const uppy = useUppyWithSupabase({ bucketName: 'assets', getUploadUrlAction })

  useEffect(() => {
    // Set up Uppy Dashboard to display as an inline component within a specified target
    uppy.use(Dashboard, {
      inline: true, // Ensures the dashboard is rendered inline
      target: '#drag-drop-area', // HTML element where the dashboard renders
      showProgressDetails: true, // Show progress details for file uploads
      proudlyDisplayPoweredByUppy: false,
    })
  }, [])

  return <div id="drag-drop-area"></div>
}

export const useUppyWithSupabase = ({
  bucketName,
  getUploadUrlAction,
}: {
  bucketName: string
  getUploadUrlAction: GetUploadUrlAction
}) => {
  // Initialize Uppy instance only once
  const [uppy] = useState(() => new Uppy())

  useEffect(() => {
    const initializeUppy = async () => {
      const { token, url, apiKey } = await getUploadUrlAction()

      uppy
        .use(Tus, {
          endpoint: url,
          retryDelays: [0, 3000, 5000, 10000, 20000], // Retry delays for resumable uploads
          headers: {
            authorization: `Bearer ${token}`, // User session access token
            apikey: apiKey, // API key for Supabase
          },
          uploadDataDuringCreation: true, // Send metadata with file chunks
          removeFingerprintOnSuccess: true, // Remove fingerprint after successful upload
          chunkSize: 6 * 1024 * 1024, // Chunk size for TUS uploads (6MB)
          allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'], // Metadata fields allowed for the upload
          onError: (error) => console.error('Upload error:', error), // Error handling for uploads
        })
        .on('file-added', (file) => {
          // Attach metadata to each file, including bucket name and content type
          file.meta = {
            ...file.meta,
            bucketName, // Bucket specified by the user of the hook
            objectName: file.name, // Use file name as object name
            contentType: file.type, // Set content type based on file MIME type
          }

          console.info('metadata', file.meta)
        })
    }

    // Initialize Uppy with Supabase settings
    initializeUppy()
  }, [uppy, bucketName])

  // Return the configured Uppy instance
  return uppy
}
