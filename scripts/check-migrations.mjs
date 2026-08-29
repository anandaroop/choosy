#!/usr/bin/env node
/// Runs before `next dev`. Blocks startup on definitely-pending migrations
/// (a stale local schema causes confusing runtime errors), but only warns
/// when Postgres itself is unreachable (e.g. before `yarn db:up`) so dev
/// isn't blocked just because the DB container isn't running yet.
import { spawnSync } from "node:child_process"

const result = spawnSync("yarn", ["prisma", "migrate", "status"], {
  encoding: "utf-8",
})

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`

if (result.status === 0) {
  process.exit(0)
}

const isUnreachable =
  /Can't reach database server/i.test(output) ||
  /P1001/.test(output) ||
  /P1003/.test(output)

if (isUnreachable) {
  console.warn(
    "⚠ Could not reach the database to check migration status. " +
      "Run `yarn db:up` if it's not running yet. Continuing to start dev server."
  )
  process.exit(0)
}

console.error(
  "✗ Pending database migrations detected. Run `yarn prisma:migrate` to apply them before starting dev.\n"
)
console.error(output)
process.exit(1)
