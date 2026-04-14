import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { getThemeFontDefinition } from './fonts'
import { themeAiGeneration } from './schema'
import type { ThemeAiWorkspaceData, ThemeAiWorkspaceGeneration } from './theme-ai.shared'

export async function getThemeAiWorkspace(organizationId: string): Promise<ThemeAiWorkspaceData> {
  const [organizationRow, recentRuns] = await Promise.all([
    db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
      columns: {
        nanoId: true,
      },
    }),
    db.query.themeAiGeneration.findMany({
      where: eq(themeAiGeneration.organizationId, organizationId),
      orderBy: desc(themeAiGeneration.createdAt),
      limit: 6,
    }),
  ])

  if (!organizationRow) {
    throw new Error('Organization not found')
  }

  const recentGenerations: ThemeAiWorkspaceGeneration[] = recentRuns.map((run) => {
    const fontId = run.generatedTheme?.fonts.primary.id
    const fontLabel = fontId
      ? (getThemeFontDefinition(fontId)?.label ?? run.generatedTheme?.fonts.primary.family)
      : null

    return {
      nanoId: run.nanoId,
      status: run.status,
      createdAt: run.createdAt,
      sourceUrl: run.sourceUrl,
      sourceImageCount: run.inputImages.length,
      themeName: run.generatedTheme?.name ?? null,
      summary: run.generatedTheme?.summary ?? null,
      basePreset: run.generatedTheme?.basePreset ?? null,
      fontLabel: fontLabel ?? null,
      errorMessage: run.errorMessage ?? null,
    }
  })

  return {
    organizationNanoId: organizationRow.nanoId,
    recentGenerations,
  }
}
