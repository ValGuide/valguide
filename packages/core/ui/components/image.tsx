import { Image as UnpicImage } from '@unpic/react/base'
import { getImageComponentConfig } from '../../platform/images/image-delivery'

type ImageProps = Omit<React.ComponentProps<typeof UnpicImage>, 'transformer'>

export function Image(props: ImageProps) {
  const { transformer, breakpoints } = getImageComponentConfig()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- discriminated union breaks with Omit<>, runtime is safe
  return (
    <UnpicImage
      {...(transformer ? { transformer } : {})}
      {...(breakpoints ? { breakpoints } : {})}
      {...(props as any)}
    />
  )
}
