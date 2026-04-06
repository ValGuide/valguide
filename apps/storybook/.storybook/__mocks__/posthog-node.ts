type CaptureInput = {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}

export class PostHog {
  constructor(_key: string, _options?: Record<string, unknown>) {}

  async captureImmediate(_input: CaptureInput): Promise<void> {}

  async shutdown(): Promise<void> {}
}
