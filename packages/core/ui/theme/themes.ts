export const themes = [
  'light',
  'dark',
  'blue',
  'blue-dark',
  'green',
  'green-dark',
  'purple',
  'purple-dark',
  'sage',
  'sage-dark',
  'stone',
  'stone-dark',
  'lavender',
  'lavender-dark',
  'sand',
  'sand-dark',
  'gallery',
  'gallery-dark',
] as const

export type Theme = (typeof themes)[number]
