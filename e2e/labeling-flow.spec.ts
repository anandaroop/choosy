import { expect, test } from "./fixtures/auth"

const TARGET_1_CANDIDATES = [
  "581ccc5a7622dd71ea00109f",
  "5a905424cd530e59b0517103",
  "5c936dbfe7fdf4002ba2affd",
  "66b4d244f5422e0013115bb0",
]
const TARGET_2_CANDIDATES = [
  "5e5d96d35c859000102a8d93",
  "5e540cf3749a5e000d1a74d5",
  "55242bd27261697e3bde0300",
  "56d49157b202a3670c000088",
]
const TARGET_3_CANDIDATES = [
  "53c9b0c372616950952b0800",
  "57113901275b244329000182",
  "5723c9d38b3b81433300079c",
  "583c18b4cd530e64730000cf",
]
const TARGET_4_CANDIDATES = [
  "57e9ab0a9c18db71fd0001d6",
  "571a49dfcd530e659300197f",
  "546e6b367261690457fb0000",
  "571a45d7139b214a97002f92",
]
const TARGET_5_CANDIDATES = [
  "53198ef0c9dc240ce6000111",
  "5e343eb738f427000e0db977",
  "5ea6c8081ebdf0000f33f6f2",
  "565b9c597076d03dc1000720",
]

async function rateAllCandidates(
  page: import("@playwright/test").Page,
  candidateIds: string[]
) {
  for (const candidateId of candidateIds) {
    await page
      .getByTestId(`candidate-row-${candidateId}`)
      .getByRole("radio", { name: "Good" })
      .click()
  }
}

test("a labeler rates every target lot in the queue, through to completion", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })

  await page.goto("/label")

  // --- target-1 ---
  await expect(page.getByText("0 of 5 rated")).toBeVisible()
  await expect(page.getByText("Infinity Nets")).toBeVisible()

  const submit = page.getByRole("button", { name: "Submit" })
  await expect(submit).toBeDisabled()

  // Add a note on one candidate before rating it, and confirm the note text
  // sticks around (this also exercises the TextArea's uncontrolled-value
  // quirk noted in CandidateRow.tsx — no React console error should fire).
  const firstRow = page.getByTestId(`candidate-row-${TARGET_1_CANDIDATES[0]}`)
  await firstRow.getByRole("button", { name: "Add note" }).click()
  await firstRow.getByPlaceholder("Add a note (optional)").fill("Closest match")
  await expect(firstRow.getByPlaceholder("Add a note (optional)")).toHaveValue(
    "Closest match"
  )

  // Rate three of the four candidates via click, and confirm Submit is still
  // disabled until the last one is rated too.
  await rateAllCandidates(page, TARGET_1_CANDIDATES.slice(0, 3))
  await expect(submit).toBeDisabled()

  // The last candidate is rated via the keyboard shortcut ("1" = Good). By
  // now keyboard mode has already moved focus here after the third click.
  const lastRadio = page
    .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[3]}`)
    .getByRole("radio", { name: "Good" })
  await expect(lastRadio).toBeFocused()
  await page.keyboard.press("1")
  await expect(lastRadio).toHaveAttribute("aria-checked", "true")

  // Rating the last candidate moves keyboard focus to Submit, now enabled.
  await expect(submit).toBeFocused()
  await expect(submit).toBeEnabled()
  await submit.click()

  // --- target-2 ---
  await expect(page.getByText("1 of 5 rated")).toBeVisible()
  await expect(page.getByText("Blue Umbrella 2")).toBeVisible()
  await rateAllCandidates(page, TARGET_2_CANDIDATES)
  await submit.click()

  // --- target-3 ---
  await expect(page.getByText("2 of 5 rated")).toBeVisible()
  // exact: true, since the plain substring match also resolves against the
  // TargetLotCard's Stack ancestor's flattened text ("Julie MehretuStadia
  // IInk and...") — a strict-mode violation without it.
  await expect(page.getByText("Stadia II", { exact: true })).toBeVisible()
  await rateAllCandidates(page, TARGET_3_CANDIDATES)
  await submit.click()

  // --- target-4 ---
  await expect(page.getByText("3 of 5 rated")).toBeVisible()
  await expect(
    page.getByText("Stadtbild Madrid (Cityscape Madrid)")
  ).toBeVisible()
  await rateAllCandidates(page, TARGET_4_CANDIDATES)
  await submit.click()

  // --- target-5 ---
  await expect(page.getByText("4 of 5 rated")).toBeVisible()
  await expect(page.getByText("Away from the Flock")).toBeVisible()
  await rateAllCandidates(page, TARGET_5_CANDIDATES)
  await submit.click()

  // --- queue exhausted ---
  await expect(
    page.getByText("All caught up — no more items to label.")
  ).toBeVisible()

  expect(consoleErrors).toEqual([])
})

test("a labeler completes a target in five keystrokes", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })

  await page.goto("/label")
  await expect(page.getByText("0 of 5 rated")).toBeVisible()

  // Screen load puts keyboard focus on the first candidate's rating control.
  const firstRadio = page
    .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[0]}`)
    .getByRole("radio", { name: "Good" })
  await expect(firstRadio).toBeFocused()

  // Four keystrokes rate all four candidates and land focus on Submit.
  await page.keyboard.press("1")
  await page.keyboard.press("3")
  await page.keyboard.press("2")
  await page.keyboard.press("1")

  await expect(firstRadio).toHaveAttribute("aria-checked", "true")
  await expect(
    page
      .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[1]}`)
      .getByRole("radio", { name: "Bad" })
  ).toHaveAttribute("aria-checked", "true")
  await expect(
    page
      .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[2]}`)
      .getByRole("radio", { name: "Neutral" })
  ).toHaveAttribute("aria-checked", "true")
  await expect(
    page
      .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[3]}`)
      .getByRole("radio", { name: "Good" })
  ).toHaveAttribute("aria-checked", "true")

  const submit = page.getByRole("button", { name: "Submit" })
  await expect(submit).toBeFocused()
  await expect(submit).toBeEnabled()

  // The fifth keystroke: Enter is native activation of the focused button.
  await page.keyboard.press("Enter")

  // Advanced to the next target, with the cursor reset to its first row.
  await expect(page.getByText("1 of 5 rated")).toBeVisible()
  await expect(page.getByText("Blue Umbrella 2")).toBeVisible()
  await expect(
    page
      .getByTestId(`candidate-row-${TARGET_2_CANDIDATES[0]}`)
      .getByRole("radio", { name: "Good" })
  ).toBeFocused()

  expect(consoleErrors).toEqual([])
})

test("hovering a thumbnail shows a zoomed preview in a fixed spot", async ({
  page,
}) => {
  await page.goto("/label")
  await expect(page.getByText("0 of 5 rated")).toBeVisible()

  const zoom = page.getByTestId("image-zoom")
  await expect(zoom).toBeHidden()

  const candidateA = page
    .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[0]}`)
    .getByRole("img")
  const candidateB = page
    .getByTestId(`candidate-row-${TARGET_1_CANDIDATES[1]}`)
    .getByRole("img")

  const candidateASrc = await candidateA.getAttribute("src")
  const candidateBSrc = await candidateB.getAttribute("src")

  await candidateA.hover()
  await expect(zoom).toBeVisible()
  await expect(page.getByTestId("image-zoom-img")).toHaveAttribute(
    "src",
    candidateASrc!
  )

  // Pinned to a fixed spot, not anchored to the hovered thumbnail — hovering
  // a different row re-points the same panel rather than moving it. The
  // panel itself is right/top-anchored via CSS (`top: 16, right: 16`), so
  // its rendered width can shift a few px with each image's own aspect
  // ratio — assert the anchor (top edge, and distance from the viewport's
  // right edge) stays put, not full box equality.
  const viewport = page.viewportSize()!
  const zoomBoxBefore = await zoom.boundingBox()
  const rightGapBefore =
    viewport.width - (zoomBoxBefore!.x + zoomBoxBefore!.width)

  await candidateB.hover()
  await expect(page.getByTestId("image-zoom-img")).toHaveAttribute(
    "src",
    candidateBSrc!
  )
  const zoomBoxAfter = await zoom.boundingBox()
  const rightGapAfter = viewport.width - (zoomBoxAfter!.x + zoomBoxAfter!.width)

  expect(zoomBoxAfter!.y).toBe(zoomBoxBefore!.y)
  expect(rightGapAfter).toBeCloseTo(rightGapBefore, 0)

  await page.mouse.move(0, 0)
  await expect(zoom).toBeHidden()
})
