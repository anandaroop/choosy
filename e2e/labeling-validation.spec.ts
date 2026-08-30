import { expect, test } from "./fixtures/auth"

const TARGET_1_CANDIDATES = [
  "581ccc5a7622dd71ea00109f",
  "5a905424cd530e59b0517103",
  "5c936dbfe7fdf4002ba2affd",
  "66b4d244f5422e0013115bb0",
]

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
  await expect(page.getByText("Infinity Nets")).toBeVisible()

  // A second tab, same signed-in labeler, also looking at the same
  // not-yet-completed target — simulating two tabs open on the same task.
  const stalePage = await context.newPage()
  await stalePage.goto("/label")
  await expect(stalePage.getByText("Infinity Nets")).toBeVisible()

  // The first tab completes and submits target-1, advancing its queue.
  await rateAllGood(page)
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByText("1 of 5 rated")).toBeVisible()

  // The second tab, unaware target-1 is already done, submits anyway.
  await rateAllGood(stalePage)
  await stalePage.getByRole("button", { name: "Submit" }).click()

  await expect(
    stalePage.getByText("Couldn't submit — try again", { exact: true })
  ).toBeVisible()
})
