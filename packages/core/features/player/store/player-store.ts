import { createStore } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlayerState, PlayerStop, PlayerStore } from '../types'

const initialState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  currentStopNanoId: null,
  stops: [],
}

export const createPlayerStore = () =>
  createStore<PlayerStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        play: () => set({ isPlaying: true }),

        pause: () => set({ isPlaying: false }),

        togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

        seek: (time: number) => {
          const { duration } = get()
          const clampedTime = Math.max(0, Math.min(time, duration))
          set({ currentTime: clampedTime })
        },

        skip: (seconds: number) => {
          const { currentTime, duration } = get()
          const newTime = Math.max(0, Math.min(currentTime + seconds, duration))
          set({ currentTime: newTime })
        },

        setSpeed: (speed: number) => set({ speed }),

        nextStop: () => {
          const { stops, currentStopNanoId } = get()
          const currentIndex = stops.findIndex((s) => s.nanoId === currentStopNanoId)
          if (currentIndex < stops.length - 1) {
            const nextStop = stops[currentIndex + 1]
            set({
              currentStopNanoId: nextStop.nanoId,
              currentTime: 0,
              duration: nextStop.duration ?? 0,
              isPlaying: true,
            })
          }
        },

        prevStop: () => {
          const { stops, currentStopNanoId, currentTime } = get()
          const currentIndex = stops.findIndex((s) => s.nanoId === currentStopNanoId)

          // If more than 3 seconds in, restart current track
          if (currentTime > 3) {
            set({ currentTime: 0 })
            return
          }

          if (currentIndex > 0) {
            const prevStop = stops[currentIndex - 1]
            set({
              currentStopNanoId: prevStop.nanoId,
              currentTime: 0,
              duration: prevStop.duration ?? 0,
              isPlaying: true,
            })
          }
        },

        setCurrentStop: (nanoId: string) => {
          const { stops } = get()
          const stop = stops.find((s) => s.nanoId === nanoId)
          set({
            currentStopNanoId: nanoId,
            currentTime: 0,
            duration: stop?.duration ?? 0,
            isPlaying: true,
          })
        },

        setStops: (stops: PlayerStop[]) => set({ stops }),

        syncPlayback: (time: number, duration: number) =>
          set({
            currentTime: time,
            duration,
          }),

        reset: () => set(initialState),
      }),
      {
        name: 'valguide-player',
        partialize: (state) => ({ speed: state.speed }),
      },
    ),
  )

export type PlayerStoreApi = ReturnType<typeof createPlayerStore>
