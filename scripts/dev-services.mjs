import { spawnSync } from 'node:child_process'

const DEV_PORTS = [
  { label: 'app dev', port: 3000 },
  { label: 'admin dev', port: 3001 },
  { label: 'studio dev', port: 3002 },
  { label: 'links dev', port: 3003 },
  { label: 'www dev', port: 3004 },
  { label: 'docs dev', port: 3006 },
  { label: 'storybook dev', port: 6006 },
  { label: 'storybook worker', port: 8787 },
]
const CADDY_PORTS = [80, 443, 2019]

export function listListeningPids(port) {
  const result = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
    encoding: 'utf8',
  })

  if (result.status === 1) {
    return []
  }

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `lsof failed for port ${port}`)
  }

  return result.stdout
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value !== process.pid)
}

export function isCaddyMatch(match) {
  return match.label === 'local Caddy'
}

export function describeMatches(matches) {
  return matches.map(({ label, pid, port }) => `${label}:${port}(${pid})`).join(', ')
}

function listCaddyMatches() {
  const counts = new Map()

  for (const port of CADDY_PORTS) {
    for (const pid of listListeningPids(port)) {
      counts.set(pid, (counts.get(pid) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([pid]) => ({ label: 'local Caddy', port: 443, pid }))
}

export function listDevServiceMatches() {
  const devMatches = DEV_PORTS.flatMap(({ label, port }) =>
    listListeningPids(port).map((pid) => ({ label, port, pid })),
  )

  return [...new Map([...devMatches, ...listCaddyMatches()].map((match) => [match.pid, match])).values()]
}
