import { createContext, type ReactNode, useContext, useRef } from 'react'
import type { PlayerStop } from '../types'
import { createPlayerStore, type PlayerStoreApi } from './player-store'

const PlayerStoreContext = createContext<PlayerStoreApi | null>(null)

type PlayerProviderProps = {
  children: ReactNode
  stops?: PlayerStop[]
  initialStopNanoId?: string
}

export function PlayerProvider({ children, stops = [], initialStopNanoId }: PlayerProviderProps) {
  const storeRef = useRef<PlayerStoreApi | null>(null)

  if (!storeRef.current) {
    storeRef.current = createPlayerStore()

    if (stops.length > 0) {
      storeRef.current.getState().setStops(stops)
    }
    if (initialStopNanoId) {
      const stop = stops.find((s) => s.nanoId === initialStopNanoId)
      storeRef.current.setState({
        currentStopNanoId: initialStopNanoId,
        duration: stop?.duration ?? 0,
      })
    }
  }

  return <PlayerStoreContext.Provider value={storeRef.current}>{children}</PlayerStoreContext.Provider>
}

export function usePlayerStoreContext() {
  const store = useContext(PlayerStoreContext)
  if (!store) {
    throw new Error('usePlayerStoreContext must be used within PlayerProvider')
  }
  return store
}
