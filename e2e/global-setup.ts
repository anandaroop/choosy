import { execSync } from "child_process"

import { E2E_DATABASE_URL } from "./constants"

const E2E_DB_NAME = "choosy_e2e"

/**
 * Ensures a dedicated, disposable `choosy_e2e` database exists and is
 * migrated, reusing the same docker-compose Postgres container as local dev
 * (`yarn db:up`) — never `choosy_development`, so e2e runs never touch a
 * developer's seeded data.
 *
 * This existence-check assumes CREATE DATABASE privileges on a Postgres
 * instance we fully own (true for the local container). If choosy ever
 * moves onto a managed provider that doesn't grant that, replace this
 * function's body with a no-op — `DATABASE_URL` would then point at an
 * e2e database provisioned out-of-band, and `prisma migrate deploy` below
 * is all that's still needed. No other file in the e2e suite depends on
 * this bootstrap step.
 */
export default async function globalSetup(): Promise<void> {
  ensureDatabaseExists()

  execSync("yarn prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
  })
}

function ensureDatabaseExists(): void {
  const exists = execSync(
    `docker-compose exec -T postgres psql -U choosy -d choosy_development -tAc "SELECT 1 FROM pg_database WHERE datname = '${E2E_DB_NAME}'"`,
    { encoding: "utf-8" }
  ).trim()

  if (exists === "1") {
    return
  }

  execSync(
    `docker-compose exec -T postgres psql -U choosy -d choosy_development -c "CREATE DATABASE ${E2E_DB_NAME}"`,
    { stdio: "inherit" }
  )
}
