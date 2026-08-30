import { expect, test } from "@playwright/test"

test("shows a generic sign-in error with the error code interpolated", async ({
  page,
}) => {
  await page.goto("/auth/error?error=OAuthCallback")

  await expect(
    page.getByRole("heading", { name: "Sign-in error" })
  ).toBeVisible()
  await expect(page.getByText(/\(OAuthCallback\)/)).toBeVisible()
})
