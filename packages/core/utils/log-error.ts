export function logError(error: unknown, context?: Record<string, unknown>) {
  if (error instanceof Error) {
    console.error('[APP ERROR]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    })
  } else {
    console.error('[APP ERROR]', { error, ...context })
  }
}
