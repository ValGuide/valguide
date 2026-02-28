import { Image as UnpicImage } from '@unpic/react/base'
import { transform as imagekitTransform } from 'unpic/providers/imagekit'
import { clientEnv } from '../../env/client'

type ImageProps = Omit<React.ComponentProps<typeof UnpicImage>, 'transformer'>

function cloudflareGuardTransform(src: string | URL, operations?: { width?: number; height?: number }) {
  const url = new URL(src)
  const r2Base = clientEnv.VITE_R2_PUBLIC_URL

  const r2Origin = new URL(r2Base)
  let storagePath = url.pathname
  if (url.origin === r2Origin.origin) {
    storagePath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
  }

  const parts: string[] = []
  if (operations?.width) parts.push(`w-${operations.width}`)
  if (operations?.height) parts.push(`h-${operations.height}`)
  const transformSegment = parts.length > 0 ? parts.join(',') : 'w-1920'

  return `${r2Base}/i/${transformSegment}/${storagePath}`
}

const isCloudflare = clientEnv.VITE_IMAGE_PROVIDER === 'cloudflare'
const transformer = isCloudflare ? cloudflareGuardTransform : imagekitTransform

const CLOUDFLARE_BREAKPOINTS = [320, 640, 960, 1280, 1920]

export function Image(props: ImageProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- discriminated union breaks with Omit<>, runtime is safe
  return (
    <UnpicImage
      transformer={transformer}
      {...(isCloudflare ? { breakpoints: CLOUDFLARE_BREAKPOINTS } : {})}
      {...(props as any)}
    />
  )
}
