export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if (import.meta.env.DEV) return

  navigator.serviceWorker.register('/sw.js')
}

export function notifyServiceWorker(message: Record<string, unknown>) {
  const sw = navigator.serviceWorker
  if (!sw) return

  if (sw.controller) {
    sw.controller.postMessage(message)
  } else {
    sw.addEventListener(
      'controllerchange',
      () => {
        sw.controller?.postMessage(message)
      },
      { once: true },
    )
  }
}
