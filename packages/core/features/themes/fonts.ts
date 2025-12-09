import type { ThemeFont } from './types'

export interface FontDefinition {
  family: string
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting'
  source: 'system' | 'google'
  fallback: string
  weights?: number[]
}

export const systemFonts: FontDefinition[] = [
  { family: 'Inter', category: 'sans-serif', source: 'system', fallback: 'ui-sans-serif, system-ui, sans-serif' },
  { family: 'Arial', category: 'sans-serif', source: 'system', fallback: 'Helvetica, sans-serif' },
  { family: 'Helvetica', category: 'sans-serif', source: 'system', fallback: 'Arial, sans-serif' },
  { family: 'Georgia', category: 'serif', source: 'system', fallback: 'Times New Roman, serif' },
  { family: 'Times New Roman', category: 'serif', source: 'system', fallback: 'Georgia, serif' },
  { family: 'Courier New', category: 'monospace', source: 'system', fallback: 'monospace' },
]

export const googleFonts: FontDefinition[] = [
  {
    family: 'Roboto',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 700],
  },
  {
    family: 'Open Sans',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 600, 700],
  },
  { family: 'Lato', category: 'sans-serif', source: 'google', fallback: 'Arial, sans-serif', weights: [400, 700] },
  {
    family: 'Montserrat',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 600, 700],
  },
  {
    family: 'Poppins',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 600, 700],
  },
  {
    family: 'Nunito',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 600, 700],
  },
  {
    family: 'Raleway',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 600, 700],
  },
  {
    family: 'Work Sans',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 600, 700],
  },
  {
    family: 'Source Sans Pro',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 600, 700],
  },
  {
    family: 'DM Sans',
    category: 'sans-serif',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 700],
  },
  {
    family: 'Playfair Display',
    category: 'serif',
    source: 'google',
    fallback: 'Georgia, serif',
    weights: [400, 500, 600, 700],
  },
  { family: 'Merriweather', category: 'serif', source: 'google', fallback: 'Georgia, serif', weights: [400, 700] },
  { family: 'Lora', category: 'serif', source: 'google', fallback: 'Georgia, serif', weights: [400, 500, 600, 700] },
  { family: 'Crimson Text', category: 'serif', source: 'google', fallback: 'Georgia, serif', weights: [400, 600, 700] },
  { family: 'Libre Baskerville', category: 'serif', source: 'google', fallback: 'Georgia, serif', weights: [400, 700] },
  {
    family: 'Oswald',
    category: 'display',
    source: 'google',
    fallback: 'Arial, sans-serif',
    weights: [400, 500, 600, 700],
  },
  { family: 'Bebas Neue', category: 'display', source: 'google', fallback: 'Arial, sans-serif', weights: [400] },
  { family: 'Fira Code', category: 'monospace', source: 'google', fallback: 'monospace', weights: [400, 500, 700] },
  {
    family: 'JetBrains Mono',
    category: 'monospace',
    source: 'google',
    fallback: 'monospace',
    weights: [400, 500, 700],
  },
]

export const allFonts: FontDefinition[] = [...systemFonts, ...googleFonts]

export function getFontDefinition(family: string): FontDefinition | undefined {
  return allFonts.find((f) => f.family === family)
}

export function fontToThemeFont(font: FontDefinition): ThemeFont {
  return {
    source: font.source,
    family: font.family,
    fallback: font.fallback,
  }
}

export function buildGoogleFontsUrl(fonts: ThemeFont[]): string | null {
  const googleFontsList = fonts.filter((f) => f.source === 'google')
  if (googleFontsList.length === 0) return null

  const families = googleFontsList.map((f) => {
    const def = getFontDefinition(f.family)
    const weights = def?.weights ?? [400, 700]
    return `family=${encodeURIComponent(f.family)}:wght@${weights.join(';')}`
  })

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

export function buildFontFamilyCss(font: ThemeFont): string {
  const fallback = font.fallback ?? 'sans-serif'
  return `"${font.family}", ${fallback}`
}
