import { S3Client } from '@aws-sdk/client-s3'
import { serverEnv } from '../../env/server'

let _client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!_client) {
    if (!serverEnv.R2_ENDPOINT || !serverEnv.R2_ACCESS_KEY_ID || !serverEnv.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2 environment variables not configured (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)')
    }
    _client = new S3Client({
      region: 'auto',
      endpoint: serverEnv.R2_ENDPOINT,
      credentials: {
        accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
        secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return _client
}

export function getR2Bucket(): string {
  return serverEnv.R2_BUCKET_NAME
}
