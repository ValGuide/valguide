import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'

export interface CreateThemeData {
  organizationId: string
  name: string
  basePreset: ThemePreset
  colors: ThemeColors
  radius: number
  fonts: ThemeFonts
}

export interface UpdateThemeData {
  name?: string
  basePreset?: ThemePreset
  colors?: ThemeColors
  radius?: number
  fonts?: ThemeFonts
}

export async function fetchOrgThemes(organizationId?: string): Promise<Theme[]> {
  const url = organizationId ? `/api/themes?organizationId=${organizationId}` : '/api/themes'
  const res = await fetch(url)

  if (res.status === 401) {
    throw new Error('You must be logged in to view themes')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch themes: ${res.statusText}`)
  }

  const data = await res.json()

  return data.map((theme: Theme & { createdAt?: string; updatedAt?: string }) => ({
    ...theme,
    createdAt: theme.createdAt ? new Date(theme.createdAt) : undefined,
    updatedAt: theme.updatedAt ? new Date(theme.updatedAt) : undefined,
  }))
}

export async function fetchThemeById(id: string): Promise<Theme | null> {
  const res = await fetch(`/api/themes/${id}`)

  if (res.status === 401) {
    throw new Error('You must be logged in to view this theme')
  }

  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch theme: ${res.statusText}`)
  }

  const data = await res.json()

  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  }
}

export async function createThemeApi(data: CreateThemeData): Promise<Theme> {
  const res = await fetch('/api/themes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (res.status === 401) {
    throw new Error('You must be logged in to create themes')
  }

  if (res.status === 409) {
    throw new Error('A theme with this name already exists')
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error ?? `Failed to create theme: ${res.statusText}`)
  }

  const created = await res.json()

  return {
    ...created,
    createdAt: created.createdAt ? new Date(created.createdAt) : undefined,
    updatedAt: created.updatedAt ? new Date(created.updatedAt) : undefined,
  }
}

export async function updateThemeApi(id: string, data: UpdateThemeData): Promise<Theme> {
  const res = await fetch(`/api/themes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (res.status === 401) {
    throw new Error('You must be logged in to update themes')
  }

  if (res.status === 404) {
    throw new Error('Theme not found')
  }

  if (res.status === 409) {
    throw new Error('A theme with this name already exists')
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error ?? `Failed to update theme: ${res.statusText}`)
  }

  const updated = await res.json()

  return {
    ...updated,
    createdAt: updated.createdAt ? new Date(updated.createdAt) : undefined,
    updatedAt: updated.updatedAt ? new Date(updated.updatedAt) : undefined,
  }
}

export async function deleteThemeApi(id: string): Promise<void> {
  const res = await fetch(`/api/themes/${id}`, {
    method: 'DELETE',
  })

  if (res.status === 401) {
    throw new Error('You must be logged in to delete themes')
  }

  if (res.status === 404) {
    throw new Error('Theme not found')
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error ?? `Failed to delete theme: ${res.statusText}`)
  }
}
