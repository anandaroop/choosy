import { expect, test } from "./fixtures/auth"

const TARGET_1_CANDIDATES = ["lot-1a", "lot-1b", "lot-1c", "lot-1d"]

async function rateAllGood(page: import("@playwright/test").Page) {
  for (const candidateId of TARGET_1_CANDIDATES) {
    await page
      .getByTestId(`candidate-row-${candidateId}`)
      .getByRole("radio", { name: "Good" })
      .click()
  }
}

test("resubmitting a target already completed in another tab shows an error toast", async ({
  page,
  context,
}) => {
  await page.goto("/label")
  await expect(page.getByText("Infinity Nets (TWAOA)")).toBeVisible()

  // A second tab, same signed-in labeler, also looking at the same
  // not-yet-completed target — simulating two tabs open on the same task.
  const stalePage = await context.newPage()
  await stalePage.goto("/label")
  await expect(stalePage.getByText("Infinity Nets (TWAOA)")).toBeVisible()

  // The first tab completes and submits target-1, advancing its queue.
  await rateAllGood(page)
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByText("1 of 3 rated")).toBeVisible()

  // The second tab, unaware target-1 is already done, submits anyway.
  await rateAllGood(stalePage)
  await stalePage.getByRole("button", { name: "Submit" }).click()

  await expect(
    stalePage.getByText("Couldn't submit — try again", { exact: true })
  ).toBeVisible()
})
