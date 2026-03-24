type CloudflareWorkersModule = {
  env?: {
    R2_BUCKET?: R2Bucket
  }
}

async function getCloudflareWorkersModule(): Promise<CloudflareWorkersModule> {
  return new Function("return import('cloudflare:workers')")() as Promise<CloudflareWorkersModule>
}

export async function getR2Bucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareWorkersModule()
  const bucket = env?.R2_BUCKET

  if (!bucket) {
    throw new Error('R2 bucket binding is unavailable')
  }

  return bucket
}
