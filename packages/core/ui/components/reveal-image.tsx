import { Image } from '@valguide/ui/components/image'
import { useImageReveal } from '@valguide/ui/hooks/use-image-reveal'
import { cn } from '@valguide/ui/lib/utils'

type RevealImageProps = React.ComponentProps<typeof Image> & {
  containerClassName?: string
}

export function RevealImage({ src, className, containerClassName, onLoad, onError, ...props }: RevealImageProps) {
  const { containerRef, hasMounted, imageLoaded, handleImageLoad, handleImageError } = useImageReveal({
    imageKey: typeof src === 'string' ? src : undefined,
  })
  const shouldHideUntilLoaded = hasMounted && !imageLoaded

  return (
    <div ref={containerRef} className={cn('relative h-full w-full overflow-hidden bg-muted/30', containerClassName)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-linear-to-br from-muted/80 to-muted/40 transition-opacity duration-200 motion-reduce:transition-none',
          shouldHideUntilLoaded ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Image
        {...props}
        src={src}
        onLoad={(event) => {
          handleImageLoad(event)
          onLoad?.(event)
        }}
        onError={(event) => {
          handleImageError(event)
          onError?.(event)
        }}
        className={cn(
          'h-full w-full object-cover transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transition-none',
          shouldHideUntilLoaded ? 'opacity-0 scale-[1.02] blur-sm' : 'opacity-100 scale-100 blur-0',
          className,
        )}
      />
    </div>
  )
}
