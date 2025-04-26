import { useEventListener, useIsomorphicLayoutEffect } from 'usehooks-ts'

type WindowSize = {
  width: number
  height: number
}

export const useWindowSizeEffect = (
  effect: (size: WindowSize) => void,
  options?: {
    updateOnFirstRender?: boolean
  },
) => {
  const handleSize = () => {
    effect({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  useEventListener('resize', handleSize)

  // Set size at the first client-side load
  useIsomorphicLayoutEffect(() => {
    if (options?.updateOnFirstRender) {
      handleSize()
    }
  }, [])
}
