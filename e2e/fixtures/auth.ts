import { randomUUID } from "crypto"

import { test as base } from "@playwright/test"
import { encode } from "next-auth/jwt"

import { NEXTAUTH_SECRET } from "../constants"

interface AuthFixtures {
  roles: string[]
  labelerId: string
}

/**
 * A fresh, never-before-seen labelerId per test gives every test a pristine
 * queue (labelerId has no FK, and the labeling queue/progress are scoped
 * per-labelerId against a real DB) — so tests stay isolated and parallel-safe
 * without any DB reset/truncation step. Specs that need an authenticated
 * session should import `test`/`expect` from this file instead of
 * `@playwright/test` directly; specs that need to run unauthenticated
 * (e.g. auth-error.spec.ts) can keep importing the base test.
 */
export const test = base.extend<AuthFixtures>({
  roles: [["team"], { option: true }],

  // testId alone isn't enough: it's stable across repeated `yarn e2e` runs,
  // and the labeling queue is persisted in a real DB — reusing it would let
  // a rerun find its own previous run's submissions already "completed".
  // The random suffix guarantees a fresh queue on every run; testId is kept
  // for traceability in failure output.
  labelerId: async ({}, use, testInfo) => {
    await use(`e2e-${testInfo.testId}-${randomUUID()}`)
  },

  page: async ({ page, context, roles, labelerId }, use) => {
    const token = await encode({
      secret: NEXTAUTH_SECRET,
      token: {
        name: "E2E Test User",
        email: `${labelerId}@artsymail.com`,
        sub: labelerId,
        roles,
      },
    })

    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
    ])

    await use(page)
  },
})

export { expect } from "@playwright/test"
