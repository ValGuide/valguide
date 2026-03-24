import { env } from 'cloudflare:workers'

export function getR2Bucket(): R2Bucket {
  const bucket = env.R2_BUCKET

  if (!bucket) {
    throw new Error('R2 bucket binding is unavailable')
  }

  return bucket
}
