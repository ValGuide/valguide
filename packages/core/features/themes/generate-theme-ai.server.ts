import { env } from 'cloudflare:workers'
import { Buffer } from 'node:buffer'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { getR2Bucket } from '../storage/r2'
import { createTheme } from './create-theme.server'
import { themeAiGeneration, theme as themeTable } from './schema'
import type { GenerateThemeAiInput, ThemeAiGeneratedTheme, ThemeAiWebsiteContext } from './theme-ai.shared'
import { normalizeThemeAiSuggestion } from './theme-ai.shared'

type ThemeAiGenerationResult = {
  generation: {
    nanoId: string
    createdAt: Date
    status: 'completed'
  }
  suggestion: ThemeAiGeneratedTheme
  createdTheme: typeof themeTable.$inferSelect
}

type AiBinding = {
  run: (model: string, inputs: unknown) => Promise<unknown>
}

function getAiBinding(): AiBinding {
  const ai = (env as unknown as { AI?: AiBinding }).AI
  if (!ai) {
    throw new Error('Workers AI binding is unavailable')
  }
  return ai
}

function extractMetaContent(html: string, name: string): string | undefined {
  const regex = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
  return html.match(regex)?.[1]?.trim()
}

function extractTitle(html: string): string | undefined {
  return html
    .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/\s+/g, ' ')
    .trim()
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function extractWebsiteContext(sourceUrl: string): Promise<ThemeAiWebsiteContext> {
  try {
    const response = await fetch(sourceUrl, {
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'ValGuide Theme AI/1.0',
      },
    })

    if (!response.ok) {
      return {
        requestedUrl: sourceUrl,
        error: `Website fetch failed with ${response.status}`,
      }
    }

    const html = await response.text()
    const cleanText = stripHtml(html).slice(0, 2000)

    return {
      requestedUrl: sourceUrl,
      finalUrl: response.url,
      title: extractTitle(html),
      description: extractMetaContent(html, 'description'),
      themeColor: extractMetaContent(html, 'theme-color'),
      ogImageUrl: extractMetaContent(html, 'og:image'),
      textExcerpt: cleanText,
    }
  } catch (error) {
    return {
      requestedUrl: sourceUrl,
      error: error instanceof Error ? error.message : 'Unknown website fetch error',
    }
  }
}

async function readImageAsDataUri(storagePath: string): Promise<string> {
  const bucket = getR2Bucket()
  const object = await bucket.get(storagePath)

  if (!object) {
    throw new Error(`Inspiration image not found in storage: ${storagePath}`)
  }

  const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream'
  const bytes = await object.arrayBuffer()
  return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`
}

async function describeVisualReferences(imagePaths: string[]): Promise<string | null> {
  if (imagePaths.length === 0) {
    return null
  }

  const ai = getAiBinding()
  const imageUrls = await Promise.all(imagePaths.slice(0, 3).map((storagePath) => readImageAsDataUri(storagePath)))
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    {
      type: 'text',
      text: 'Analyze these museum brand reference images. Describe color palette, mood, typography direction, contrast, materials, and visitor-facing design cues in one compact paragraph.',
    },
    ...imageUrls.map((url) => ({
      type: 'image_url',
      image_url: { url },
    })),
  ]

  const response = (await ai.run('@cf/meta/llama-3.2-11b-vision-instruct', {
    messages: [
      {
        role: 'user',
        content,
      },
    ],
    max_tokens: 350,
    temperature: 0.2,
  })) as { response?: string }

  return response.response?.trim() ?? null
}

function buildPresetPrompt(): string {
  return [
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
    'curator',
    'curator-dark',
    'claude',
    'claude-dark',
    'angle',
    'angle-dark',
  ].join(', ')
}

function buildFontPrompt(): string {
  return [
    'system-sans: neutral device sans-serif',
    'noto-sans: modern self-hosted sans-serif',
    'arial: classic sans-serif',
    'helvetica: clean neo-grotesque sans-serif',
    'system-serif: calm editorial serif',
    'vollkorn: rich editorial serif',
    'georgia: familiar readable serif',
    'times-new-roman: traditional print serif',
    'jetbrains-mono: technical monospace',
    'courier-new: classic monospace',
  ].join('\n')
}

function extractJsonObjectFromAiResponse(rawResponse: string): string {
  const trimmedResponse = rawResponse.trim()

  if (trimmedResponse.startsWith('```')) {
    const fencedMatch = trimmedResponse.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
    if (fencedMatch?.[1]) {
      return fencedMatch[1].trim()
    }
  }

  const firstBraceIndex = trimmedResponse.indexOf('{')
  const lastBraceIndex = trimmedResponse.lastIndexOf('}')

  if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
    return trimmedResponse.slice(firstBraceIndex, lastBraceIndex + 1)
  }

  return trimmedResponse
}

async function resolveUniqueThemeName(organizationId: string, preferredName: string): Promise<string> {
  const existingThemes = await db.query.theme.findMany({
    where: eq(themeTable.organizationId, organizationId),
    columns: {
      name: true,
    },
  })
  const existingNames = new Set(existingThemes.map((theme) => theme.name))
  const trimmedPreferredName = preferredName.trim() || 'Generated Theme'

  if (!existingNames.has(trimmedPreferredName)) {
    return trimmedPreferredName
  }

  let suffix = 2
  while (existingNames.has(`${trimmedPreferredName} ${suffix}`)) {
    suffix += 1
  }

  return `${trimmedPreferredName} ${suffix}`
}

async function generateSuggestedTheme(params: {
  sourceUrl?: string
  notes?: string
  websiteContext?: ThemeAiWebsiteContext | null
  visualAnalysis?: string | null
}): Promise<ThemeAiGeneratedTheme> {
  const ai = getAiBinding()
  const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      {
        role: 'system',
        content: [
          'You create polished visitor-facing themes for museum guides.',
          'Return JSON only.',
          'The design should feel trustworthy, editorial, and calm.',
          'Prefer strong contrast and accessible reading over novelty.',
          `Allowed preset ids: ${buildPresetPrompt()}.`,
          `Allowed font ids:\n${buildFontPrompt()}`,
          'Return colors as 6-digit hex values. Omit tokens you are unsure about.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify({
          sourceUrl: params.sourceUrl ?? null,
          notes: params.notes ?? null,
          websiteContext: params.websiteContext ?? null,
          visualAnalysis: params.visualAnalysis ?? null,
          requiredShape: {
            name: 'string',
            summary: 'string <= 280 chars',
            moodKeywords: ['string'],
            sourceHighlights: ['string'],
            basePreset: 'allowed preset id',
            radius: 'one of 0, 0.5, 1.5, 2',
            fontId: 'allowed font id',
            colors: {
              background: '#RRGGBB',
              foreground: '#RRGGBB',
              card: '#RRGGBB',
              cardForeground: '#RRGGBB',
              popover: '#RRGGBB',
              popoverForeground: '#RRGGBB',
              primary: '#RRGGBB',
              primaryForeground: '#RRGGBB',
              secondary: '#RRGGBB',
              secondaryForeground: '#RRGGBB',
              muted: '#RRGGBB',
              mutedForeground: '#RRGGBB',
              accent: '#RRGGBB',
              accentForeground: '#RRGGBB',
              destructive: '#RRGGBB',
              destructiveForeground: '#RRGGBB',
              border: '#RRGGBB',
              input: '#RRGGBB',
              ring: '#RRGGBB',
            },
          },
        }),
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1200,
    temperature: 0.3,
  })

  const rawResponse =
    typeof response === 'string'
      ? response.trim()
      : typeof response === 'object' &&
          response !== null &&
          'response' in response &&
          typeof response.response === 'string'
        ? response.response.trim()
        : ''
  if (!rawResponse) {
    throw new Error('Workers AI did not return a theme suggestion')
  }

  const jsonResponse = extractJsonObjectFromAiResponse(rawResponse)

  try {
    return normalizeThemeAiSuggestion(JSON.parse(jsonResponse))
  } catch (error) {
    const preview = jsonResponse.slice(0, 300)
    throw new Error(
      `Workers AI returned invalid theme JSON: ${error instanceof Error ? error.message : 'Unknown parse error'}. Response preview: ${preview}`,
    )
  }
}

export async function generateThemeAi(
  input: GenerateThemeAiInput,
  organizationId: string,
  userId: string,
): Promise<ThemeAiGenerationResult> {
  const organizationRow = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    columns: {
      id: true,
    },
  })

  if (!organizationRow) {
    throw new Error('Organization not found')
  }

  const [createdRun] = await db
    .insert(themeAiGeneration)
    .values({
      nanoId: input.runNanoId,
      organizationId,
      sourceUrl: input.sourceUrl ?? null,
      notes: input.notes ?? null,
      inputImages: input.images,
      status: 'pending',
      createdBy: userId,
    })
    .returning({
      nanoId: themeAiGeneration.nanoId,
      createdAt: themeAiGeneration.createdAt,
    })

  try {
    const [websiteContext, visualAnalysis] = await Promise.all([
      input.sourceUrl ? extractWebsiteContext(input.sourceUrl) : Promise.resolve(null),
      describeVisualReferences(input.images.map((image) => image.storagePath)),
    ])

    const suggestion = await generateSuggestedTheme({
      sourceUrl: input.sourceUrl,
      notes: input.notes,
      websiteContext,
      visualAnalysis,
    })
    const createdTheme = await createTheme({
      organizationId,
      name: await resolveUniqueThemeName(organizationId, suggestion.name),
      basePreset: suggestion.basePreset,
      colors: suggestion.colors,
      radius: suggestion.radius,
      fonts: suggestion.fonts,
      metadata: {
        origin: 'ai',
        aiGenerationNanoId: input.runNanoId,
      },
      createdBy: userId,
    })
    const savedSuggestion = {
      ...suggestion,
      name: createdTheme.name,
    }

    await db
      .update(themeAiGeneration)
      .set({
        status: 'completed',
        websiteContext,
        visualAnalysis,
        generatedTheme: savedSuggestion,
        errorMessage: null,
      })
      .where(eq(themeAiGeneration.nanoId, input.runNanoId))

    return {
      generation: {
        nanoId: createdRun.nanoId,
        createdAt: createdRun.createdAt,
        status: 'completed',
      },
      suggestion: savedSuggestion,
      createdTheme,
    }
  } catch (error) {
    await db
      .update(themeAiGeneration)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown AI generation error',
      })
      .where(eq(themeAiGeneration.nanoId, input.runNanoId))

    throw error
  }
}
