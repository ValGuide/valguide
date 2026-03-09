import * as React from 'react'

type UseImageRevealOptions = {
  imageKey: string | undefined
}

export function useImageReveal({ imageKey }: UseImageRevealOptions) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset reveal state when the image URL key changes.
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
