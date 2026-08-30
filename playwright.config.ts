import { defineConfig, devices } from "@playwright/test"

import { BASE_URL, E2E_DATABASE_URL, NEXTAUTH_SECRET } from "./e2e/constants"

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Run next dev directly (bypassing the `check-migrations` guard `yarn
    // dev` runs) — global setup applies migrations to choosy_e2e explicitly
    // before this starts.
    command: "yarn next dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXTAUTH_SECRET,
      NEXTAUTH_URL: BASE_URL,
      DATABASE_URL: E2E_DATABASE_URL,
      GRAVITY_URL: "https://api.artsy.net",
      NEXT_PUBLIC_GRAVITY_URL: "https://api.artsy.net",
      CLIENT_APPLICATION_ID: "e2e-unused-client-id",
      CLIENT_APPLICATION_SECRET: "e2e-unused-client-secret",
      // Left unset deliberately: the labeling `denied` path (no team role)
      // should deterministically resolve to `unleash-unavailable` with no
      // network call, matching real environments before Unleash is set up.
      UNLEASH_SERVER_KEY: "",
    },
  },
})
