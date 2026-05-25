#!/usr/bin/env node

import { chmod, lstat, mkdir, readlink, symlink, unlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { delimiter, resolve } from 'node:path'
import { trackValTelemetry } from './val/telemetry.mjs'

const repoRoot = resolve(import.meta.dirname, '..')
const launcherPath = resolve(repoRoot, 'val')
const binDirectory = process.env.VAL_BIN_DIR || resolve(homedir(), '.local', 'bin')
const linkPath = resolve(binDirectory, 'val')

function pathIncludes(directory) {
  return (process.env.PATH || '').split(delimiter).some((entry) => {
    if (!entry) return false
    return resolve(entry) === directory
  })
}

try {
  await chmod(launcherPath, 0o755)
  await mkdir(binDirectory, { recursive: true })

  let existing = null
  try {
    existing = await lstat(linkPath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  if (existing) {
    if (!existing.isSymbolicLink()) {
      throw new Error(`${linkPath} already exists and is not a symlink. Move it aside before running this setup.`)
    }

    const currentTarget = resolve(binDirectory, await readlink(linkPath))
    if (currentTarget !== launcherPath) {
      await unlink(linkPath)
      await symlink(launcherPath, linkPath)
      console.log(`Updated ${linkPath} -> ${launcherPath}`)
    } else {
      console.log(`Already configured: ${linkPath} -> ${launcherPath}`)
    }
  } else {
    await symlink(launcherPath, linkPath)
    console.log(`Created ${linkPath} -> ${launcherPath}`)
  }

  if (!pathIncludes(binDirectory)) {
    console.warn(`Warning: ${binDirectory} is not on PATH for this shell.`)
    console.warn('Add it to your shell profile, then open a new terminal before running bare "val".')
  }

  await trackValTelemetry('val.install.completed', {
    path_on_shell: pathIncludes(binDirectory),
  })
} catch (error) {
  console.error(`val:setup: ${error.message}`)
  process.exit(1)
}
