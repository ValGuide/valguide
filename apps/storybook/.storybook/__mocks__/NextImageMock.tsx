import React from 'react'

// Simple mock for next/image
const NextImage = (props: any) => {
  const { src, alt, ...rest } = props
  return <img src={typeof src === 'string' ? src : src.src} alt={alt} {...rest} />
}

export default NextImage
