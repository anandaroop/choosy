// Shared between playwright.config.ts's webServer env and e2e/fixtures/auth.ts,
// so the injected session cookie is signed with the same secret the app
// verifies. e2e-only — never a real production value.
export const NEXTAUTH_SECRET = "e2e-test-secret-not-for-production"
export const BASE_URL = "http://localhost:3000"

export const E2E_DATABASE_URL =
  "postgresql://choosy:choosy@localhost:5434/choosy_e2e?schema=public"
