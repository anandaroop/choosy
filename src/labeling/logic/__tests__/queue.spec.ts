import { Dataset } from "labeling/types"

import { selectNextItem } from "../queue"

function makeDataset(): Dataset {
  return {
    version: "test-v1",
    items: [
      {
        targetId: "target-1",
        target: {
          id: "lot-target-1",
          imageUrl: "https://example.com/1.jpg",
          artistName: "Artist One",
          title: "Target One",
          details: "",
        },
        candidates: [],
      },
      {
        targetId: "target-2",
        target: {
          id: "lot-target-2",
          imageUrl: "https://example.com/2.jpg",
          artistName: "Artist Two",
          title: "Target Two",
          details: "",
        },
        candidates: [],
      },
      {
        targetId: "target-3",
        target: {
          id: "lot-target-3",
          imageUrl: "https://example.com/3.jpg",
          artistName: "Artist Three",
          title: "Target Three",
          details: "",
        },
        candidates: [],
      },
    ],
  }
}

describe("selectNextItem", () => {
  const dataset = makeDataset()

  it("returns the first item when nothing is completed", () => {
    const item = selectNextItem(dataset, [])
    expect(item?.targetId).toBe("target-1")
  })

  it("returns the next unlabeled item when some are completed", () => {
    const item = selectNextItem(dataset, ["target-1"])
    expect(item?.targetId).toBe("target-2")
  })

  it("returns null when every item is completed", () => {
    const item = selectNextItem(dataset, ["target-1", "target-2", "target-3"])
    expect(item).toBeNull()
  })

  it("is stable across repeated calls with the same input", () => {
    const first = selectNextItem(dataset, ["target-1"])
    const second = selectNextItem(dataset, ["target-1"])
    expect(first?.targetId).toBe(second?.targetId)
  })

  it("gives each labeler the first item unlabeled for them, regardless of others' completions", () => {
    // Labeler A has done target-1; labeler B has done target-2. Neither
    // labeler's progress affects what the other is offered.
    const nextForA = selectNextItem(dataset, ["target-1"])
    const nextForB = selectNextItem(dataset, ["target-2"])
    expect(nextForA?.targetId).toBe("target-2")
    expect(nextForB?.targetId).toBe("target-1")
  })
})
