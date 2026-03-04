import * as React from 'react'

type UseImageRevealOptions = {
  imageKey: string | undefined
}

export const IMAGE_REVEAL_PLACEHOLDER_CLASS =
  'pointer-events-none absolute inset-0 bg-linear-to-br from-muted/80 to-muted/40 transition-opacity duration-500 motion-reduce:transition-none'

export const IMAGE_REVEAL_IMAGE_CLASS =
  'h-full w-full object-cover transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-none'

export function getImageRevealStateClasses(imageLoaded: boolean) {
  return {
    placeholder: imageLoaded ? 'opacity-0' : 'opacity-100',
    image: imageLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.02] blur-sm',
  } as const
}

export function useImageReveal({ imageKey }: UseImageRevealOptions) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  React.useEffect(() => {
    setImageLoaded(false)
  }, [imageKey])

  const handleImageLoad: NonNullable<React.ImgHTMLAttributes<HTMLImageElement>['onLoad']> = () => {
    setImageLoaded(true)
  }

  const handleImageError: NonNullable<React.ImgHTMLAttributes<HTMLImageElement>['onError']> = () => {
    setImageLoaded(true)
  }

  return {
    imageLoaded,
    handleImageLoad,
    handleImageError,
  }
}
