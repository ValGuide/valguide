import type { ImageProps } from 'next/image'

const NextImage = (props: ImageProps) => {
  const { fill, style, src, alt, ...rest } = props
  const finalStyle = fill
    ? {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: (props.objectFit as string) || 'cover',
        ...style,
      }
    : style
  // biome-ignore lint/performance/noImgElement: This is a mock for Storybook
  return <img src={typeof src === 'string' ? src : src.src} alt={alt} style={finalStyle} {...rest} />
}

export default NextImage
