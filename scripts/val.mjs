#!/usr/bin/env node

import { createValCli } from './val/cli.mjs'
import { registerValGuideCommands } from './val/commands.mjs'

const cli = createValCli({
  cwd: process.cwd(),
})

registerValGuideCommands(cli)

await cli.run(process.argv.slice(2))
