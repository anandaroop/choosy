import { Dataset } from "labeling/types"

import { computeProgress } from "../progress"

function makeDataset(targetIds: string[]): Dataset {
  return {
    version: "test-v1",
    items: targetIds.map((targetId) => ({
      targetId,
      target: {
        id: `lot-${targetId}`,
        imageUrl: "https://example.com/1.jpg",
        artistName: "Artist",
        title: "Title",
        details: "",
      },
      candidates: [],
    })),
  }
}

describe("computeProgress", () => {
  const dataset = makeDataset(["target-1", "target-2", "target-3"])

  it("reports 0 completed for a fresh labeler", () => {
    expect(computeProgress(dataset, [])).toEqual({
      completed: 0,
      total: 3,
      remaining: 3,
    })
  })

  it("reports all completed when done", () => {
    expect(
      computeProgress(dataset, ["target-1", "target-2", "target-3"])
    ).toEqual({ completed: 3, total: 3, remaining: 0 })
  })

  it("reports a mid-way count", () => {
    expect(computeProgress(dataset, ["target-1"])).toEqual({
      completed: 1,
      total: 3,
      remaining: 2,
    })
  })

  it("handles an empty dataset", () => {
    expect(computeProgress(makeDataset([]), [])).toEqual({
      completed: 0,
      total: 0,
      remaining: 0,
    })
  })

  it("ignores completions for targets no longer in the dataset", () => {
    expect(computeProgress(dataset, ["target-1", "stale-target"])).toEqual({
      completed: 1,
      total: 3,
      remaining: 2,
    })
  })
})
