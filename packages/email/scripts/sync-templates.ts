/**
 * Syncs email templates to Resend.
 *
 * Usage: pnpm dlx tsx scripts/sync-templates.ts
 *
 * Environment variables:
 * - RESEND_API_KEY: Your Resend API key with write access
 */

import { render } from '@react-email/render'
import React from 'react'
import { Resend } from 'resend'
import { templates } from '../templates'

const RESEND_API_KEY = process.env.RESEND_ADMIN_API_KEY

if (!RESEND_API_KEY) {
  console.error('Error: RESEND_ADMIN_API_KEY environment variable is required')
  process.exit(1)
}

const resend = new Resend(RESEND_API_KEY)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function syncTemplates() {
  console.log(`Syncing ${templates.length} templates to Resend...\n`)

  const { data: existingTemplates, error: listError } = await resend.templates.list({ limit: 100 })

  if (listError) {
    console.error('Failed to list existing templates:', listError)
    process.exit(1)
  }

  const existingByAlias = new Map(existingTemplates?.data?.map((t) => [t.alias, t]) ?? [])

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i]
    const { config, component, text } = template

    // Rate limit: 2 requests per second, so wait 600ms between templates
    if (i > 0) {
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

  console.log('\n✅ Template sync complete!')
}

syncTemplates().catch(console.error)
