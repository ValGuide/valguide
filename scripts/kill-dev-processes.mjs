#!/usr/bin/env node

import { describeMatches, isCaddyMatch, listDevServiceMatches, listListeningPids } from './dev-services.mjs'

const WAIT_TIMEOUT_MS = 5_000
const WAIT_INTERVAL_MS = 200

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sendSignal(matches, signal) {
  const failures = []

  for (const { pid } of matches) {
    try {
      process.kill(pid, signal)
    } catch (error) {
      if (error.code === 'ESRCH') {
        continue
      }

      failures.push({ pid, code: error.code ?? 'UNKNOWN' })
    }
  }

  return failures
}

async function waitForExit(matches) {
  const tracked = matches.map(({ label, port, pid }) => ({ label, port, pid }))
  const startedAt = Date.now()

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    const remaining = tracked.filter(({ port, pid }) => {
      if (isCaddyMatch({ label: 'local Caddy', port, pid })) {
        return listDevServiceMatches().some((match) => match.pid === pid && isCaddyMatch(match))
      }

      return listListeningPids(port).includes(pid)
    })
    if (remaining.length === 0) {
      return []
    }

    await sleep(WAIT_INTERVAL_MS)
  }

  return tracked.filter(({ port, pid }) => {
    if (isCaddyMatch({ label: 'local Caddy', port, pid })) {
      return listDevServiceMatches().some((match) => match.pid === pid && isCaddyMatch(match))
    }

    return listListeningPids(port).includes(pid)
  })
}

async function main() {
  const uniqueMatches = listDevServiceMatches()

  if (uniqueMatches.length === 0) {
    console.log('No running Val development services found.')
    return
  }

  console.log(`Stopping: ${describeMatches(uniqueMatches)}`)

  const termFailures = sendSignal(uniqueMatches, 'SIGTERM')
  if (termFailures.length > 0) {
    const details = termFailures.map(({ pid, code }) => `${pid}:${code}`).join(', ')
    console.error(`Could not signal some processes: ${details}`)
  }

  const remaining = await waitForExit(uniqueMatches)
  if (remaining.length === 0) {
    console.log('Stopped Val development services.')
    return
  }

  console.log(`Escalating to SIGKILL for: ${describeMatches(remaining)}`)
  const killFailures = sendSignal(remaining, 'SIGKILL')
  if (killFailures.length > 0) {
    const details = killFailures.map(({ pid, code }) => `${pid}:${code}`).join(', ')
    console.error(`Could not force-stop some processes: ${details}`)
  }

  const stubborn = await waitForExit(remaining)
  if (stubborn.length > 0) {
    console.error(`Failed to stop: ${describeMatches(stubborn)}`)
    process.exit(1)
  }

  console.log('Stopped Val development services.')
}

main().catch((error) => {
  console.error(`val kill: ${error.message}`)
  process.exit(1)
})
