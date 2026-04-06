import { serverEnv } from './env-server.ts'

export const env = {
  ...serverEnv,
}

export function waitUntil(_promise: Promise<unknown>): void {
  // Storybook runs in a browser-like environment without the Workers runtime.
}
