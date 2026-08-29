import { Dataset, Lot } from "labeling/types"

import dataset from "data/loadDataset"
import { assertDatasetValid, DatasetIntegrityError } from "../dataset"

function makeLot(id: string, overrides: Partial<Lot> = {}): Lot {
  return {
    id,
    imageUrl: `https://example.com/${id}.jpg`,
    artistName: "Artist",
    title: "Title",
    details: "",
    ...overrides,
  }
}

function makeValidDataset(): Dataset {
  return {
    version: "test-v1",
    items: [
      {
        targetId: "target-1",
        target: makeLot("lot-target-1"),
        candidates: [makeLot("lot-1a"), makeLot("lot-1b")],
      },
      {
        targetId: "target-2",
        target: makeLot("lot-target-2"),
        candidates: [makeLot("lot-2a"), makeLot("lot-2b")],
      },
    ],
  }
}

describe("assertDatasetValid", () => {
  it("accepts a well-formed dataset", () => {
    expect(() => assertDatasetValid(makeValidDataset())).not.toThrow()
  })

  it("rejects a duplicate lot id across targets", () => {
    const ds = makeValidDataset()
    ds.items[1].target = makeLot("lot-target-1")

    expect(() => assertDatasetValid(ds)).toThrow(DatasetIntegrityError)
  })

  it("rejects a target with no candidates", () => {
    const ds = makeValidDataset()
    ds.items[0].candidates = []

    expect(() => assertDatasetValid(ds)).toThrow(/has no candidates/)
  })

  it("rejects a target listed as its own candidate", () => {
    const ds = makeValidDataset()
    ds.items[0].candidates.push(makeLot("lot-target-1"))

    expect(() => assertDatasetValid(ds)).toThrow(
      /lists itself as its own candidate/
    )
  })

  it("rejects a duplicate candidate within a target", () => {
    const ds = makeValidDataset()
    ds.items[0].candidates.push(makeLot("lot-1a"))

    expect(() => assertDatasetValid(ds)).toThrow(
      /Duplicate candidate "lot-1a" within target "target-1"/
    )
  })

  // Regression guard: the committed comps-v1.json fixture must always pass
  // integrity checks, since it's shipped straight to labelers.
  it("accepts the shipped comps-v1 fixture", () => {
    expect(() => assertDatasetValid(dataset)).not.toThrow()
  })
})
