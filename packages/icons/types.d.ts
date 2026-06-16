import type { FC, SVGProps } from 'react'

declare module '*.svg' {
  const ReactComponent: FC<SVGProps<SVGSVGElement>>
  const content: string

  export { ReactComponent }
  export default content
}
