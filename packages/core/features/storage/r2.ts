/// <reference path="./cloudflare-r2.d.ts" />
import { env } from 'cloudflare:workers'

export function getR2Bucket(): R2Bucket {
  return env.R2_BUCKET
}
