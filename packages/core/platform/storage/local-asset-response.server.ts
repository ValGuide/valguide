import { isLocalRuntime } from '../runtime/runtime-mode.server'
import { getObject } from './object-storage.server'

function resolveStorageKey(request: Request, prefix: string): string | null {
  const url = new URL(request.url)
  if (!url.pathname.startsWith(prefix)) {
    return null
  }

  const rawKey = url.pathname.slice(prefix.length)
  const storageKey = rawKey
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .join('/')

  return storageKey || null
}

export async function createLocalAssetResponse(request: Request, prefix = '/api/assets/'): Promise<Response> {
  if (!isLocalRuntime()) {
    return new Response('Not found', { status: 404 })
  }

  const storageKey = resolveStorageKey(request, prefix)
  if (!storageKey) {
    return new Response('Not found', { status: 404 })
  }

  const object = await getObject(storageKey)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(await object.arrayBuffer(), {
    headers: {
      'cache-control': 'no-store',
      'content-type': object.contentType ?? 'application/octet-stream',
      etag: object.etag,
    },
  })
}
