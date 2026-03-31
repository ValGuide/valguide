import { serverEnv } from '../../env/server'

export function resolveStudioEventsSlackChannel(): string {
  const isDevEnv = serverEnv.VITE_ENV === 'dev' || serverEnv.VITE_ENV === 'local'
  return serverEnv.STUDIO_EVENTS_SLACK_CHANNEL || (isDevEnv ? 'studio-events-dev' : 'studio-events')
}
