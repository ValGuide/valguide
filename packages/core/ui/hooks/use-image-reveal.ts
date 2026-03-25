import * as React from 'react'

type UseImageRevealOptions = {
  imageKey: string | undefined
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

export function useImageReveal({ imageKey }: UseImageRevealOptions) {
  const [hasMounted, setHasMounted] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    setHasMounted(true)

    const image = containerRef.current?.querySelector('img')
    setImageLoaded(image?.complete === true)
  }, [imageKey])

  const handleImageLoad: NonNullable<React.ImgHTMLAttributes<HTMLImageElement>['onLoad']> = () => {
    setImageLoaded(true)
  }

  const handleImageError: NonNullable<React.ImgHTMLAttributes<HTMLImageElement>['onError']> = () => {
    setImageLoaded(true)
  }

  return {
    containerRef,
    hasMounted,
    imageLoaded,
    handleImageLoad,
    handleImageError,
  }
}
