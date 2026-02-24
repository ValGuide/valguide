import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BINDING_KEYS = ['kv_namespaces', 'r2_buckets', 'd1_databases'] as const

function parseJsonc(raw: string) {
  const json = raw.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([\]}])/g, '$1')
  return JSON.parse(json)
}

/**
 * Generates a `.wrangler.dev-remote.json` config file from `wrangler.jsonc`
 * with `remote: true` on all `env.dev` bindings. Returns the path for use
 * as `configPath` in the cloudflare vite plugin.
 */
export function getRemoteDevConfigPath(dir = '.') {
  const config = parseJsonc(readFileSync(resolve(dir, 'wrangler.jsonc'), 'utf-8'))
  const devConfig = config.env?.dev ?? {}

  // Start from top-level config, override bindings with env.dev versions + remote: true
  const remoteConfig = { ...config }
  delete remoteConfig.env
  delete remoteConfig.routes

  for (const key of BINDING_KEYS) {
    const bindings = devConfig[key] ?? config[key]
    if (bindings) {
      remoteConfig[key] = bindings.map((b: Record<string, unknown>) => ({
        ...b,
        remote: true,
      }))
    }
  }

  const outPath = resolve(dir, '.wrangler.dev-remote.json')
  writeFileSync(outPath, JSON.stringify(remoteConfig, null, 2))
  return outPath
}
