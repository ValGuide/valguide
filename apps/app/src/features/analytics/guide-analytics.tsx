import { useCurrentStopNanoId, useIsPlaying } from '@valguide/core/features/player/store/use-player-store'
import { useEffect, useRef } from 'react'

const VISITOR_ID_STORAGE_KEY = 'valguide-analytics-visitor-id'

type AnalyticsEventPayload = {
  visitorId: string
  tourNanoId: string
  stopNanoId?: string
  eventType: 'tour_opened' | 'stop_opened' | 'audio_played'
  locale?: string | null
  path?: string | null
}

function getVisitorId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedVisitorId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY)
  if (storedVisitorId) {
    return storedVisitorId
  }

  const visitorId = window.crypto.randomUUID()
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId)

  return visitorId
}

async function sendAnalyticsEvent(payload: Omit<AnalyticsEventPayload, 'visitorId'>) {
  const visitorId = getVisitorId()

  if (!visitorId) {
    return
  }

  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        visitorId,
        path: window.location.pathname,
      }),
      keepalive: true,
    })
  } catch (error) {
    console.error('Failed to record guide analytics event', error)
  }
}

export function TourAnalyticsTracker({
  disabled = false,
  locale,
  tourNanoId,
}: {
  disabled?: boolean
  locale: string
  tourNanoId: string
}) {
  const trackedTourRef = useRef<string | null>(null)

  useEffect(() => {
    if (disabled || trackedTourRef.current === tourNanoId) {
      return
    }

    trackedTourRef.current = tourNanoId

    void sendAnalyticsEvent({
      tourNanoId,
      eventType: 'tour_opened',
      locale,
    })
  }, [disabled, locale, tourNanoId])

  return null
}

export function StopAnalyticsTracker({
  disabled = false,
  locale,
  stopNanoId,
  tourNanoId,
}: {
  disabled?: boolean
  locale: string
  stopNanoId: string
  tourNanoId: string
}) {
  const isPlaying = useIsPlaying()
  const currentStopNanoId = useCurrentStopNanoId()
  const openedStopRef = useRef<string | null>(null)
  const playedStopsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (disabled || openedStopRef.current === stopNanoId) {
      return
    }

    openedStopRef.current = stopNanoId

    void sendAnalyticsEvent({
      tourNanoId,
      stopNanoId,
      eventType: 'stop_opened',
      locale,
    })
  }, [disabled, locale, stopNanoId, tourNanoId])

  useEffect(() => {
    if (disabled || !isPlaying || currentStopNanoId !== stopNanoId || playedStopsRef.current.has(stopNanoId)) {
      return
    }

    playedStopsRef.current.add(stopNanoId)

    void sendAnalyticsEvent({
      tourNanoId,
      stopNanoId,
      eventType: 'audio_played',
      locale,
    })
  }, [currentStopNanoId, disabled, isPlaying, locale, stopNanoId, tourNanoId])

  return null
}
