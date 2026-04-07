import {
  allFonts,
  buildThemeFontStylesheetLinks,
  collectThemeFontDefinitions,
  type FontDefinition,
} from '@valguide/core/features/themes/fonts'
import type { ThemeFonts } from '@valguide/core/features/themes/types'

const loadedStylesheets = new Map<string, Promise<void>>()

function quoteFontFamilyIfNeeded(family: string): string {
  if (family.includes(',') || family.includes('"') || family.includes("'")) {
    return family
  }
  if (family.includes(' ')) {
    return `"${family}"`
  }
  return family
}

function ensureStylesheet(href: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve()
  }

  const existing = loadedStylesheets.get(href)
  if (existing) {
    return existing
  }

  const currentLink = document.head.querySelector<HTMLLinkElement>(`link[data-theme-font-href="${href}"]`)
  if (currentLink) {
    const resolvedPromise = Promise.resolve()
    loadedStylesheets.set(href, resolvedPromise)
    return resolvedPromise
  }

  const promise = new Promise<void>((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.themeFontHref = href
    link.onload = () => resolve()
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })

  loadedStylesheets.set(href, promise)
  return promise
}

async function warmFontFaces(fonts: FontDefinition[]) {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return
  }

  await Promise.all(
    fonts.map((font) => document.fonts.load(`1rem ${quoteFontFamilyIfNeeded(font.family)}`).catch(() => undefined)),
  )
}

export async function ensureThemeFontsLoaded(fonts: ThemeFonts) {
  const definitions = collectThemeFontDefinitions(fonts)
  const links = buildThemeFontStylesheetLinks(fonts)

  await Promise.all(links.map((link) => ensureStylesheet(link.href)))
  await warmFontFaces(definitions)
}

export async function ensureThemeFontPreviewCatalogLoaded() {
  const previewDefinitions = allFonts.filter((font) => font.source === 'self-hosted')
  await Promise.all(
    previewDefinitions
      .map((font) => font.stylesheetHref)
      .filter((href): href is string => Boolean(href))
      .map((href) => ensureStylesheet(href)),
  )
  await warmFontFaces(previewDefinitions)
}
