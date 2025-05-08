'use client'

import { useEffect, useState } from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import Dashboard from '@uppy/dashboard'
import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'

const projectURL = process.env.VG_SUPABASE_URL!!
const anonKey = process.env.VG_SUPABASE_ANON_KEY!!

export function UppyExample() {
  // Initialize Uppy instance with the 'sample' bucket specified for uploads
  const uppy = useUppyWithSupabase({ bucketName: 'sample' })

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

/**
 * Custom hook for configuring Uppy with Supabase authentication and TUS resumable uploads
 * @param {Object} options - Configuration options for the Uppy instance.
 * @param {string} options.bucketName - The bucket name in Supabase where files are stored.
 * @returns {Object} uppy - Uppy instance with configured upload settings.
 */
export const useUppyWithSupabase = ({ bucketName }: { bucketName: string }) => {
  // Initialize Uppy instance only once
  const [uppy] = useState(() => new Uppy())
  // Initialize Supabase client with project URL and anon key
  const supabase = createClient()

  useEffect(() => {
    const initializeUppy = async () => {
      // Retrieve the current user's session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.info('JWT', session)

      uppy
        .use(Tus, {
          endpoint: `${projectURL}/storage/v1/upload/resumable`, // Supabase TUS endpoint
          retryDelays: [0, 3000, 5000, 10000, 20000], // Retry delays for resumable uploads
          headers: {
            authorization: `Bearer ${session?.access_token}`, // User session access token
            apikey: anonKey, // API key for Supabase
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
        })
    }

    // Initialize Uppy with Supabase settings
    initializeUppy()
  }, [uppy, bucketName])

  // Return the configured Uppy instance
  return uppy
}
