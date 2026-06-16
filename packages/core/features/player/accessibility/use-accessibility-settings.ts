import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TextSize = 'small' | 'medium' | 'large' | 'xlarge'

type AccessibilityState = {
  highContrast: boolean
  largeText: boolean
  textSize: TextSize
  reducedMotion: boolean
}

type AccessibilityActions = {
  setHighContrast: (enabled: boolean) => void
  toggleHighContrast: () => void
  setLargeText: (enabled: boolean) => void
  toggleLargeText: () => void
  setTextSize: (size: TextSize) => void
  setReducedMotion: (enabled: boolean) => void
  toggleReducedMotion: () => void
  reset: () => void
}

export type AccessibilityStore = AccessibilityState & AccessibilityActions

const initialState: AccessibilityState = {
  highContrast: false,
  largeText: false,
  textSize: 'medium',
  reducedMotion: false,
}

export const useAccessibilitySettings = create<AccessibilityStore>()(
  persist(
    (set) => ({
      ...initialState,

      setHighContrast: (enabled) => set({ highContrast: enabled }),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),

      setLargeText: (enabled) => set({ largeText: enabled }),
      toggleLargeText: () => set((state) => ({ largeText: !state.largeText })),

      setTextSize: (size) => set({ textSize: size }),

      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      reset: () => set(initialState),
    }),
    {
      name: 'valguide-accessibility',
    },
  ),
)

export const TEXT_SIZE_CLASSES: Record<TextSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
  xlarge: 'text-xl',
}
