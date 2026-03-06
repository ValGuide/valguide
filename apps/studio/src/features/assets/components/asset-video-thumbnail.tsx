import { getAssetVideoThumbnailUrl } from '@valguide/core/features/assets/image-url'
import { Image } from '@valguide/ui/components/image'
import { cn } from '@valguide/ui/lib/utils'
import { Video } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type AssetVideoThumbnailProps = {
  storagePath: string
  alt: string
  width: number
  height?: number
  timeSeconds?: number
  className?: string
  iconClassName?: string
}

export function AssetVideoThumbnail({
  storagePath,
  alt,
  width,
  height,
  timeSeconds = 2,
  className,
  iconClassName,
}: AssetVideoThumbnailProps) {
  const [hasError, setHasError] = useState(false)

  const thumbnailUrl = useMemo(
    () =>
      getAssetVideoThumbnailUrl(storagePath, {
        width,
        height,
        timeSeconds,
        format: 'jpg',
      }),
    [height, storagePath, timeSeconds, width],
  )

  useEffect(() => {
    setHasError(false)
  }, [thumbnailUrl])

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Video className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
      </div>
    )
  }

  return (
    <Image
      src={thumbnailUrl}
      alt={alt}
      layout="constrained"
      width={width}
      height={height ?? width}
      onError={() => setHasError(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
