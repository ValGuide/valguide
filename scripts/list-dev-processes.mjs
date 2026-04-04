#!/usr/bin/env node

import { listDevServiceMatches } from './dev-services.mjs'

function main() {
  const matches = listDevServiceMatches().sort((left, right) => left.port - right.port || left.pid - right.pid)

  if (matches.length === 0) {
    console.log('No running Val development services found.')
    return
  }

  console.log('PID    PORT  SERVICE')
  for (const match of matches) {
    console.log(`${String(match.pid).padEnd(6)} ${String(match.port).padEnd(5)} ${match.label}`)
  }
}

main()
