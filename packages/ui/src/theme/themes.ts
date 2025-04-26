export const themes = ['light', 'dark', 'blue', 'blue-dark', 'green', 'green-dark', 'purple', 'purple-dark'] as const

export type Theme = (typeof themes)[number]
