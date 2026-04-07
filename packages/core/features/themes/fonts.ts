import type { ThemeConfig, ThemeFont, ThemeFonts } from './types'

export interface FontDefinition {
  id: string
  label: string
  family: string
  category: 'sans-serif' | 'serif' | 'monospace'
  source: 'system' | 'self-hosted'
  fallback: string
  description: string
  previewText: string
  stylesheetHref?: string
  preloadHrefs?: string[]
}

export interface ThemeFontLink {
  rel: 'stylesheet' | 'preload'
  href: string
  as?: 'font'
  type?: string
  crossOrigin?: 'anonymous'
}

const themeFontCatalog: FontDefinition[] = [
  {
    id: 'system-sans',
    label: 'System Sans',
    family: 'system-ui',
    category: 'sans-serif',
    source: 'system',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
    description: 'Fast, neutral device sans-serif',
    previewText: 'Clear wayfinding and captions',
  },
  {
    id: 'noto-sans',
    label: 'Noto Sans',
    family: 'Theme Noto Sans',
    category: 'sans-serif',
    source: 'self-hosted',
    fallback: "'Noto Sans Variable', 'Noto Sans Fallback', sans-serif",
    description: 'Self-hosted modern sans-serif for tours',
    previewText: 'Clear wayfinding and captions',
    stylesheetHref: '/fonts/theme/theme-noto-sans.css',
    preloadHrefs: ['/fonts/noto-sans-latin-wght-normal.woff2', '/fonts/noto-sans-latin-ext-wght-normal.woff2'],
  },
  {
    id: 'arial',
    label: 'Arial',
    family: 'Arial',
    category: 'sans-serif',
    source: 'system',
    fallback: 'Helvetica, sans-serif',
    description: 'Widely available classic sans-serif',
    previewText: 'Straightforward labels and body text',
  },
  {
    id: 'helvetica',
    label: 'Helvetica',
    family: 'Helvetica',
    category: 'sans-serif',
    source: 'system',
    fallback: 'Arial, sans-serif',
    description: 'Clean neo-grotesque sans-serif',
    previewText: 'Crisp exhibition labels and UI',
  },
  {
    id: 'system-serif',
    label: 'System Serif',
    family: 'ui-serif',
    category: 'serif',
    source: 'system',
    fallback: 'Georgia, serif',
    description: 'Device serif with a calm editorial tone',
    previewText: 'Long-form stories and commentary',
  },
  {
    id: 'vollkorn',
    label: 'Vollkorn',
    family: 'Theme Vollkorn',
    category: 'serif',
    source: 'self-hosted',
    fallback: "'Vollkorn Variable', Georgia, serif",
    description: 'Self-hosted editorial serif for rich storytelling',
    previewText: 'Long-form stories and commentary',
    stylesheetHref: '/fonts/theme/theme-vollkorn.css',
    preloadHrefs: ['/fonts/vollkorn-latin-wght-normal.woff2', '/fonts/vollkorn-latin-ext-wght-normal.woff2'],
  },
  {
    id: 'georgia',
    label: 'Georgia',
    family: 'Georgia',
    category: 'serif',
    source: 'system',
    fallback: "'Times New Roman', serif",
    description: 'Readable, familiar web serif',
    previewText: 'Long-form stories and commentary',
  },
  {
    id: 'times-new-roman',
    label: 'Times New Roman',
    family: "'Times New Roman'",
    category: 'serif',
    source: 'system',
    fallback: 'Georgia, serif',
    description: 'Traditional print-style serif',
    previewText: 'Historical notes and archival context',
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: 'Theme JetBrains Mono',
    category: 'monospace',
    source: 'self-hosted',
    fallback: "'JetBrains Mono Variable', monospace",
    description: 'Self-hosted monospace for technical captions',
    previewText: 'Object number 01A',
    stylesheetHref: '/fonts/theme/theme-jetbrains-mono.css',
    preloadHrefs: [
      '/fonts/jetbrains-mono-latin-wght-normal.woff2',
      '/fonts/jetbrains-mono-latin-ext-wght-normal.woff2',
    ],
  },
  {
    id: 'courier-new',
    label: 'Courier New',
    family: "'Courier New'",
    category: 'monospace',
    source: 'system',
    fallback: 'monospace',
    description: 'Classic system monospace',
    previewText: 'Object number 01A',
  },
]

const fontCatalogById = new Map(themeFontCatalog.map((font) => [font.id, font]))
const fontCatalogByFamily = new Map(themeFontCatalog.map((font) => [normalizeFamilyKey(font.family), font]))
const legacyFamilyToId = new Map<string, string>([
  ['inter', 'system-sans'],
  ['roboto', 'system-sans'],
  ['open sans', 'system-sans'],
  ['lato', 'system-sans'],
  ['montserrat', 'system-sans'],
  ['poppins', 'system-sans'],
  ['nunito', 'system-sans'],
  ['raleway', 'system-sans'],
  ['work sans', 'system-sans'],
  ['source sans pro', 'system-sans'],
  ['dm sans', 'system-sans'],
  ['playfair display', 'vollkorn'],
  ['merriweather', 'vollkorn'],
  ['lora', 'vollkorn'],
  ['crimson text', 'vollkorn'],
  ['libre baskerville', 'vollkorn'],
  ['oswald', 'system-sans'],
  ['bebas neue', 'system-sans'],
  ['fira code', 'jetbrains-mono'],
  ['jetbrains mono', 'jetbrains-mono'],
  ['jetbrains mono variable', 'jetbrains-mono'],
  ['noto sans', 'noto-sans'],
  ['noto sans variable', 'noto-sans'],
  ['vollkorn', 'vollkorn'],
  ['vollkorn variable', 'vollkorn'],
  ['arial', 'arial'],
  ['helvetica', 'helvetica'],
  ['georgia', 'georgia'],
  ['times new roman', 'times-new-roman'],
  ['courier new', 'courier-new'],
  ['system-ui', 'system-sans'],
  ['ui-serif', 'system-serif'],
])

function normalizeFamilyKey(value: string): string {
  return value.replaceAll('"', '').replaceAll("'", '').trim().toLowerCase()
}

function quoteFontFamilyIfNeeded(family: string): string {
  if (family.includes(',')) {
    return family
  }
  if (family.includes("'") || family.includes('"')) {
    return family
  }
  if (family.includes(' ')) {
    return `"${family}"`
  }
  return family
}

function getThemeFontSource(font: FontDefinition): ThemeFont['source'] {
  return font.source === 'self-hosted' ? 'self-hosted' : 'system'
}

function normalizeSingleThemeFont(font: ThemeFont, strict: boolean): ThemeFont {
  if (font.id) {
    const byId = fontCatalogById.get(font.id)
    if (byId) {
      return fontToThemeFont(byId)
    }
    if (strict) {
      throw new Error(`Unknown theme font: ${font.id}`)
    }
  }

  const familyKey = normalizeFamilyKey(font.family)
  const mappedId = legacyFamilyToId.get(familyKey)
  if (mappedId) {
    const mappedFont = fontCatalogById.get(mappedId)
    if (mappedFont) {
      return fontToThemeFont(mappedFont)
    }
  }

  const byFamily = fontCatalogByFamily.get(familyKey)
  if (byFamily) {
    return fontToThemeFont(byFamily)
  }

  if (strict) {
    throw new Error(`Unknown theme font family: ${font.family}`)
  }

  const fallbackFont = getThemeFontDefinition('system-sans')
  if (!fallbackFont) {
    throw new Error('Missing fallback theme font: system-sans')
  }

  return fontToThemeFont(fallbackFont)
}

function getFontsFromInput(input: ThemeFonts | ThemeConfig): ThemeFonts {
  return 'fonts' in input ? input.fonts : input
}

export const allFonts = themeFontCatalog

export function getThemeFontDefinition(id: string): FontDefinition | undefined {
  return fontCatalogById.get(id)
}

export function createThemeFont(id: string): ThemeFont {
  const font = getThemeFontDefinition(id)
  if (!font) {
    throw new Error(`Unknown theme font: ${id}`)
  }
  return fontToThemeFont(font)
}

export function fontToThemeFont(font: FontDefinition): ThemeFont {
  return {
    id: font.id,
    source: getThemeFontSource(font),
    family: font.family,
    fallback: font.fallback,
  }
}

export function resolveThemeFont(font: ThemeFont, options?: { strict?: boolean }): ThemeFont {
  return normalizeSingleThemeFont(font, options?.strict ?? false)
}

export function normalizeThemeFonts(fonts: ThemeFonts, options?: { strict?: boolean }): ThemeFonts {
  const normalizedPrimary = normalizeSingleThemeFont(fonts.primary, options?.strict ?? false)

  return {
    primary: normalizedPrimary,
    overrides: {
      ...(fonts.overrides?.heading
        ? {
            heading: normalizeSingleThemeFont(fonts.overrides.heading, options?.strict ?? false),
          }
        : {}),
      ...(fonts.overrides?.body
        ? {
            body: normalizeSingleThemeFont(fonts.overrides.body, options?.strict ?? false),
          }
        : {}),
      ...(fonts.overrides?.caption
        ? {
            caption: normalizeSingleThemeFont(fonts.overrides.caption, options?.strict ?? false),
          }
        : {}),
    },
  }
}

export function buildFontFamilyCss(font: ThemeFont): string {
  const normalizedFont = resolveThemeFont(font)
  const fallback = normalizedFont.fallback ?? 'sans-serif'
  return `${quoteFontFamilyIfNeeded(normalizedFont.family)}, ${fallback}`
}

export function collectThemeFontDefinitions(input: ThemeFonts | ThemeConfig): FontDefinition[] {
  const normalizedFonts = normalizeThemeFonts(getFontsFromInput(input))
  const fontIds = [normalizedFonts.primary.id].filter((value): value is string => Boolean(value))

  return [...new Set(fontIds)]
    .map((fontId) => getThemeFontDefinition(fontId))
    .filter((font): font is FontDefinition => Boolean(font))
}

export function buildThemeFontStylesheetLinks(input: ThemeFonts | ThemeConfig): ThemeFontLink[] {
  return collectThemeFontDefinitions(input)
    .flatMap((font) =>
      font.stylesheetHref
        ? [
            {
              rel: 'stylesheet' as const,
              href: font.stylesheetHref,
            },
          ]
        : [],
    )
    .filter((link, index, links) => links.findIndex((candidate) => candidate.href === link.href) === index)
}

export function buildThemeFontPreloadLinks(input: ThemeFonts | ThemeConfig): ThemeFontLink[] {
  return collectThemeFontDefinitions(input)
    .flatMap((font) =>
      (font.preloadHrefs ?? []).map((href) => ({
        rel: 'preload' as const,
        href,
        as: 'font' as const,
        type: 'font/woff2',
        crossOrigin: 'anonymous' as const,
      })),
    )
    .filter((link, index, links) => links.findIndex((candidate) => candidate.href === link.href) === index)
}
