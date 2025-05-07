import React from 'react'

// Simple mock for next/image
const NextImage = (props: any) => {
  const { fill, style, src, alt, ...rest } = props
  const finalStyle = fill
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: props.objectFit || 'cover',
        ...style,
      }
    : style
  return <img src={typeof src === 'string' ? src : src.src} alt={alt} style={finalStyle} {...rest} />
}

export default NextImage
