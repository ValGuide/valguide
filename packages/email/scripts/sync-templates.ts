/**
 * Syncs email templates to Resend.
 *
 * Usage: pnpm dlx tsx scripts/sync-templates.ts
 *
 * Environment variables:
 * - RESEND_ADMIN_API_KEY: Your Resend API key with write access
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@react-email/render'
import React from 'react'
import { Resend } from 'resend'
import { templates } from '../emails/template-registry'
import { emailLocales } from '../templates/locales'
import type { ResendTemplate } from '../templates/types'

const RESEND_API_KEY = process.env.RESEND_ADMIN_API_KEY
const dryRun = process.argv.includes('--dry-run')
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
const templateIdsOutputPath = resolve(__dirname, '../template-ids.ts')

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function assertNoDuplicateAliases(allTemplates: ResendTemplate[]) {
  const aliases = new Set<string>()
  const duplicates: string[] = []

  for (const template of allTemplates) {
    if (aliases.has(template.config.alias)) {
      duplicates.push(template.config.alias)
      continue
    }
    aliases.add(template.config.alias)
  }

  if (duplicates.length > 0) {
    throw new Error(`Duplicate template aliases found: ${duplicates.join(', ')}`)
  }
}

function assertAllLocalesPresent(allTemplates: ResendTemplate[]) {
  const byKey = new Map<string, Set<string>>()

  for (const template of allTemplates) {
    const set = byKey.get(template.config.key) ?? new Set<string>()
    set.add(template.config.locale)
    byKey.set(template.config.key, set)
  }

  for (const [key, locales] of byKey.entries()) {
    const missing = emailLocales.filter((locale) => !locales.has(locale))
    if (missing.length > 0) {
      throw new Error(`Missing locales for "${key}": ${missing.join(', ')}`)
    }
  }
}

function writeTemplateIdsFile(templateIds: Record<string, string>) {
  const entries = Object.entries(templateIds)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([alias, id]) => `  ${JSON.stringify(alias)}: ${JSON.stringify(id)},`)
    .join('\n')

  const fileContents = `${entries ? '' : ''}export const resendTemplateIds = {\n${entries}\n} as const satisfies Partial<Record<string, string>>\n`
  writeFileSync(templateIdsOutputPath, fileContents, 'utf8')
}

async function syncTemplates() {
  assertNoDuplicateAliases(templates)
  assertAllLocalesPresent(templates)

  console.log(`Syncing ${templates.length} templates to Resend...\n`)

  if (dryRun) {
    console.log('Running in dry-run mode. No Resend API calls will be made.\n')
    for (const template of templates) {
      const html = await render(React.createElement(template.component))
      console.log(`[dry-run] ${template.config.alias}`)
      console.log(`  key=${template.config.key} locale=${template.config.locale}`)
      console.log(`  subject=${template.config.subject}`)
      console.log(`  html_length=${html.length} text_length=${template.text.length}`)
    }
    console.log('\n✅ Dry-run complete!')
    return
  }

  if (!resend) {
    console.error('Error: RESEND_ADMIN_API_KEY environment variable is required')
    process.exit(1)
  }

  const { data: existingTemplates, error: listError } = await resend.templates.list({ limit: 100 })

  if (listError) {
    console.error('Failed to list existing templates:', listError)
    process.exit(1)
  }

  const existingByAlias = new Map(existingTemplates?.data?.map((t) => [t.alias, t]) ?? [])
  const templateIds: Record<string, string> = {}

  for (const [index, template] of templates.entries()) {
    const { config, component, text } = template

    // Rate limit: 2 requests per second, so wait 600ms between templates
    if (index > 0) {
      await delay(600)
    }

    console.log(`Rendering template: ${config.name} (${config.alias})`)
    const html = await render(React.createElement(component))

    const existing = existingByAlias.get(config.alias)

    if (existing) {
      console.log(`  Updating existing template...`)

      const { error: updateError } = await resend.templates.update(existing.id, {
        name: config.name,
        subject: config.subject,
        from: config.from,
        html,
        text,
        variables: config.variables,
      })

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`)
        continue
      }

      console.log(`  ✓ Updated template`)
      templateIds[config.alias] = existing.id

      await delay(600)
      const { error: publishError } = await resend.templates.publish(existing.id)
      if (publishError) {
        console.error(`  ❌ Failed to publish: ${publishError.message}`)
        continue
      }
      console.log(`  ✓ Published template`)
    } else {
      console.log(`  Creating new template...`)

      const { data: created, error: createError } = await resend.templates.create({
        name: config.name,
        alias: config.alias,
        subject: config.subject,
        from: config.from,
        html,
        text,
        variables: config.variables,
      })

      if (createError) {
        console.error(`  ❌ Failed to create: ${createError.message}`)
        continue
      }

      console.log(`  ✓ Created template with ID: ${created?.id}`)

      if (created?.id) {
        templateIds[config.alias] = created.id
        await delay(600)
        const { error: publishError } = await resend.templates.publish(created.id)
        if (publishError) {
          console.error(`  ❌ Failed to publish: ${publishError.message}`)
          continue
        }
        console.log(`  ✓ Published template`)
      }
    }
  }

  writeTemplateIdsFile(templateIds)
  console.log(`\n✓ Wrote template ID map to ${templateIdsOutputPath}`)

  console.log('\n✅ Template sync complete!')
}

syncTemplates().catch(console.error)
