import { expect, test as playwrightTest } from "@playwright/test"

import { expect as authedExpect, test as authedTest } from "./fixtures/auth"

authedTest("a team-role user reaches /label", async ({ page }) => {
  await page.goto("/label")
  await authedExpect(page).toHaveURL("/label")
  await authedExpect(page.getByText(/of 5 rated/)).toBeVisible()
})

authedTest.describe(() => {
  authedTest.use({ roles: [] })

  authedTest(
    "a signed-in user without the team role, with Unleash unavailable, is denied",
    async ({ page }) => {
      await page.goto("/label")
      await authedExpect(page).toHaveURL(
        /\/no-access\?reason=unleash-unavailable/
      )
      await authedExpect(
        page.getByRole("heading", { name: "Couldn't verify access" })
      ).toBeVisible()
    }
  )
})

playwrightTest("a logged-out visitor is denied", async ({ page }) => {
  await page.goto("/label")
  await expect(page).toHaveURL(/\/no-access\?reason=denied/)
  await expect(
    page.getByRole("heading", { name: "Access not enabled" })
  ).toBeVisible()
})
