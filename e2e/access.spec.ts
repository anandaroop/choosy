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

playwrightTest(
  "a logged-out visitor sees the sign-in shell, not a redirect",
  async ({ page }) => {
    await page.goto("/label")
    await expect(page).toHaveURL("/label")
    await expect(page.getByText("Please sign in to continue.")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Continue with Artsy" })
    ).toBeVisible()
  }
)

playwrightTest(
  "a logged-out visitor at / sees the sign-in shell",
  async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/")
    await expect(page.getByText("Please sign in to continue.")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Continue with Artsy" })
    ).toBeVisible()
  }
)

authedTest(
  "a team-role user at / sees the welcome screen and nav",
  async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Welcome to Choosy")).toBeVisible()
    await expect(page.getByRole("link", { name: "Label" })).toBeVisible()
    await expect(page.getByText(/@artsymail\.com$/)).toBeVisible()
    await expect(page.getByText("Log out")).toBeVisible()
  }
)
